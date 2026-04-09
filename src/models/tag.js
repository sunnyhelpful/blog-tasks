const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const slugify = require("slugify");

const tagSchema = new mongoose.Schema(
    {
        title: {
            type: Map,
            of: String,
            required: true,
        },
        slug: {
            type: String,
            required: false,
        },
        description: {
            type: Map,
            of: String,
            default: {},
        },
        metaTitle: {
            type: String,
            trim: true,
            maxlength: [60, "Meta title cannot exceed 60 characters"]
        },
        metaDescription: {
            type: String,
            trim: true,
            maxlength: [160, "Meta description cannot exceed 160 characters"]
        },
        searchKeywords: {
            type: [String],
            default: [],
            validate: [
                (keywords) => keywords.length <= 20,
                "Cannot have more than 20 search keywords"
            ]
        },
        parentTag: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag',
            default: null
        },
        relatedTags: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag'
        }],
        tagType: {
            type: String,
            enum: ['product', 'category', 'brand', 'promotional', 'feature', 'occasion', 'seasonal', 'other'],
            default: "product"
        },
        status: {
            type: String,
            enum: ["active", "inactive", "archived"],
            default: "active"
        },
        visibility: {
            type: String,
            enum: ["public", "private", "restricted"],
            default: "public"
        },
        priority: {
            type: Number,
            default: 0,
            min: [0, "Priority cannot be negative"],
            max: [100, "Priority cannot exceed 100"]
        },
        clickCount: {   /* Analytics */
            type: Number,
            default: 0,
            min: [0, "Click count cannot be negative"]
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

tagSchema.pre("save", async function (next) {
    if (!this.isModified("title")) return next();

    const title = this.title.get("en") || Array.from(this.title.values())[0];
    const baseSlug = slugify(title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
    });

    let slug = baseSlug;
    let counter = 1;

    const Tag = mongoose.model("Tag");
    while (await Tag.exists({ slug })) {
        slug = `${baseSlug}-${counter++}`;
    }

    this.slug = slug;
    next();
});

tagSchema.methods.softDelete = async function (deletedBy) {
    this.isDeleted = true;
    this.deletedAt = Date.now();
    this.deletedBy = deletedBy;
    this.status = "archived";
    return this.save();
};

tagSchema.methods.restoreTag = async function (restoredBy) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.status = "active";
    this.updatedBy = restoredBy;
    return this.save();
};

tagSchema.index({ title: "text", searchKeywords: "text" });
tagSchema.index({ tagType: 1, status: 1, priority: -1 });
tagSchema.index({ slug: 1 }, { unique: true });

tagSchema.virtual('tag_icon', {
    ref: 'Upload',
    localField: '_id',
    foreignField: 'uploadsable_id',
    justOne: true,
    match: { 
        uploadsable_type: 'Tag', 
        type: 'tag_icon', 
        deletedAt: null 
    },
    options: { sort: { createdAt: -1 } }
});

tagSchema.virtual('tag_image', {
    ref: 'Upload',
    localField: '_id',
    foreignField: 'uploadsable_id',
    justOne: true,
    match: { 
        uploadsable_type: 'Tag', 
        type: 'tag_image', 
        deletedAt: null 
    },
    options: { sort: { createdAt: -1 } }
});


tagSchema.methods.getFullHierarchy = async function() {
    try {
        const [ancestors, currentWithDescendants] = await Promise.all([
            this.getHierarchy(),
            this.getChildHierarchy()
        ]);
        
        const fullHierarchy = {
            ...currentWithDescendants[0],
            ancestors: ancestors[0]?.children || []
        };
        
        return fullHierarchy;
    } catch (err) {
        throw new Error(`Error fetching full hierarchy: ${err.message}`);
    }
};


tagSchema.methods.getHierarchy = async function () {
    try {
        const Tag = this.model("Tag");
    
        const result = await Tag.aggregate([
            {
            $match: { _id: this._id, isDeleted: false },
            },
            {
            $graphLookup: {
                from: "tags",
                startWith: "$parentTag",
                connectFromField: "parentTag",
                connectToField: "_id",
                as: "hierarchy",
                depthField: "depth",
                restrictSearchWithMatch: { isDeleted: false },
            },
            },
            {
            $project: {
                _id: 1,
                title: 1,
                slug: 1,
                parentTag: 1,
                description: 1,
                depth: 1,
                hierarchy: {
                $map: {
                    input: "$hierarchy",
                    as: "ancestor",
                    in: {
                    _id: "$$ancestor._id",
                    title: "$$ancestor.title",
                    slug: "$$ancestor.slug",
                    parentTag: "$$ancestor.parentTag",
                    description: "$$ancestor.description",
                    depth: "$$ancestor.depth",
                    },
                },
                },
            },
            },
        ]);
    
        const rootTag = result[0];
        const allTags = [
            {
                _id: rootTag._id,
                title: rootTag.title,
                slug: rootTag.slug,
                parentTag: rootTag.parentTag,
                description: rootTag.description,
                depth: 0,
            },
            ...rootTag.hierarchy,
        ];
    
        const buildReverseTree = (tags, currentId) => {
            const tree = [];
            const currentTag = tags.find((cat) => String(cat._id) === String(currentId));
    
            if (!currentTag) {
                return tree;
            }
    
            const node = {
                _id: currentTag._id,
                title: Object.fromEntries(new Map(Object.entries(currentTag.title))),
                slug: currentTag.slug,
                parentTag: currentTag.parentTag,
                description: Object.fromEntries(new Map(Object.entries(currentTag.description))),
                depth: currentTag.depth || 0,
            };
    
            if (currentTag.parentTag) {
            const parentTree = buildReverseTree(tags, currentTag.parentTag);
            if (parentTree.length) {
                node.children = parentTree;
            }
            }
    
            tree.push(node);
            return tree;
        };
    
        return buildReverseTree(allTags, this._id);
        } catch (err) {
            throw new Error(`Error fetching parent hierarchy: ${err.message}`);
        }
};

/* Get Child Hierarchy */
tagSchema.methods.getChildHierarchy = async function () {
    try {
        const Tag = this.model("Tag");
    
        const result = await Tag.aggregate([
            {
                $match: { _id: this._id, isDeleted: false },
            },
            {
                $graphLookup: {
                    from: "tags",
                    startWith: "$_id",
                    connectFromField: "_id",
                    connectToField: "parentTag",
                    as: "children",
                    depthField: "depth",
                    restrictSearchWithMatch: { isDeleted: false },
                },
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    slug: 1,
                    parentTag: 1,
                    description: 1,
                    depth: 1,
                    children: {
                        $map: {
                            input: "$children",
                            as: "child",
                            in: {
                            _id: "$$child._id",
                            title: "$$child.title",
                            slug: "$$child.slug",
                            parentTag: "$$child.parentTag",
                            description: "$$child.description",
                            depth: "$$child.depth",
                            },
                        },
                    },
                },
            },
        ]);
  
        const buildTree = (tags, parentTag = null) => {
            const tree = [];
            tags.forEach((tag) => {
                if (String(tag.parentTag) === String(parentTag)) {
                    const children = buildTree(tags, tag._id);
                    const node = {
                        _id: tag._id,
                        title: Object.fromEntries(new Map(Object.entries(tag.title))),
                        slug: tag.slug,
                        parentTag: tag.parentTag,
                        description: Object.fromEntries(new Map(Object.entries(tag.description))),
                        depth: tag.depth || 0,
                    };
                    if (children.length) {
                        node.children = children;
                    }
                    tree.push(node);
                }
            });
            return tree;
        };
  
      const rootTag = result[0];
      const allTags = [
        {
          _id: rootTag._id,
          title: rootTag.title,
          slug: rootTag.slug,
          parentTag: rootTag.parentTag,
          description: rootTag.description,
          depth: 0,
        },
        ...rootTag.children,
      ];
  
      return buildTree(allTags, this._id);
    } catch (err) {
        throw new Error(`Error fetching child hierarchy: ${err.message}`);
    }
};

tagSchema.methods.getSiblings = async function() {
    try {
        if (!this.parentTag) {
            return await this.model("Tag").find({
                parentTag: null,
                isDeleted: false,
                _id: { $ne: this._id }
            });
        }
        return await this.model("Tag").find({
            parentTag: this.parentTag,
            isDeleted: false,
            _id: { $ne: this._id }
        });
    } catch (err) {
        throw new Error(`Error fetching siblings: ${err.message}`);
    }
};

tagSchema.plugin(mongoosePaginate);
const Tag = mongoose.model("Tag", tagSchema, "tags");
module.exports = Tag;
