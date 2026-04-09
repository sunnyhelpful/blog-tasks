const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const slugify = require("slugify");

const categoryTypeSchema = new mongoose.Schema(
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
        category_type: {
            type: String,
            enum: ["category", "category_type", "sub_categories"],
            default: "category",
        },          
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
        attributeId: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Attribute",
            default: null,
        }],
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        isVerification: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

async function generateUniqueSlug(model, title, id = null) {
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug, isDeleted: false };
        if (id) query._id = { $ne: id };

        const exists = await model.findOne(query);
        if (!exists) break;

        slug = `${baseSlug}-${counter++}`;
    }

    return slug;
}

categoryTypeSchema.pre("save", async function (next) {
    if (this.title && this.title.get("en")) {
        this.slug = await generateUniqueSlug(this.constructor, this.title.get("en"), this._id);
    }

    next();
});

categoryTypeSchema.methods.softDelete = function (deletedBy) {
    this.isDeleted = true;
    this.deletedAt = Date.now();
    this.deletedBy = deletedBy;
    return this.save();
};


categoryTypeSchema.virtual('category_type_image', {
    ref: 'Upload',
    localField: '_id',
    foreignField: 'uploadsable_id',
    justOne: true,
    match: { uploadsable_type: 'CategoryType', type:'category_type_image', deletedAt: null },
    options: { sort: { createdAt: -1 } }
});
  
categoryTypeSchema.virtual('category_type_icon', {
    ref: 'Upload',
    localField: '_id',
    foreignField: 'uploadsable_id',
    justOne: true,
    match: { uploadsable_type: 'CategoryType', type:'category_type_icon', deletedAt: null },
    options: { sort: { createdAt: -1 } }
});

categoryTypeSchema.methods.getChildHierarchy = async function () {
    try {
        const CategoryType = this.model("CategoryType");

        const result = await CategoryType.aggregate([
            {
                $match: { _id: this._id, isDeleted: false },
            },
            {
                $graphLookup: {
                from: "categories",
                startWith: "$_id",
                connectFromField: "_id",
                connectToField: "parentId",
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
                parentId: 1,
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
                        parentId: "$$child.parentId",
                        description: "$$child.description",
                        depth: "$$child.depth",
                    },
                    },
                },
                },
            },
        ]);

        const root = result[0];
        const allCategories = [
            {
                _id: root._id,
                title: root.title,
                slug: root.slug,
                parentId: root.parentId,
                description: root.description,
                depth: 0,
            },
            ...root.children,
        ];

        const buildTree = (categories, parentId = null) => {
        return categories
            .filter(cat => String(cat.parentId) === String(parentId))
            .map(cat => {
            const children = buildTree(categories, cat._id);
            return {
                _id: cat._id,
                title: Object.fromEntries(new Map(Object.entries(cat.title))),
                slug: cat.slug,
                parentId: cat.parentId,
                description: Object.fromEntries(new Map(Object.entries(cat.description))),
                depth: cat.depth,
                ...(children.length ? { children } : {}),
            };
            });
        };

        return buildTree(allCategories, this._id);
    } catch (err) {
        throw new Error(`Error fetching child hierarchy: ${err.message}`);
    }
};


categoryTypeSchema.set("toObject", { virtuals: true });
categoryTypeSchema.set("toJSON", { virtuals: true });

categoryTypeSchema.plugin(mongoosePaginate);

const CategoryType = mongoose.model("CategoryType", categoryTypeSchema, "categories");
module.exports = CategoryType;
