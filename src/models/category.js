const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const slugify = require("slugify");

const categorySchema = new mongoose.Schema(
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
      enum: ["category_type", "category", 'sub_categories'],
      default: "category",
    },    
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
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

categorySchema.pre("save", function (next) {
  if (this.title && this.title.get("en")) {
    this.slug = slugify(this.title.get("en"), { lower: true, strict: true });
  }

  if (this.isNew) {
    this.createdBy = this.createdBy || this.updatedBy;
  } else {
    this.updatedBy = this.updatedBy;
  }

  next();
});

categorySchema.pre("remove", function (next) {
  this.deletedBy = this.deletedBy;
  next();
});

categorySchema.methods.softDelete = function (deletedBy) {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  this.deletedBy = deletedBy;
  return this.save();
};



categorySchema.methods.getParentCategory = async function () {
  if (this.parentId) {
    try {
      const parentCategory = await this.model("Category")
        .findById(this.parentId)
        .lean();
      return parentCategory;
    } catch (err) {
      throw new Error("Error fetching parent category");
    }
  }
  return null;
};

categorySchema.methods.getHierarchy = async function () {
  try {
    const Category = this.model("Category");

    const result = await Category.aggregate([
      {
        $match: { _id: this._id, isDeleted: false },
      },
      {
        $graphLookup: {
          from: "categories",
          startWith: "$parentId",
          connectFromField: "parentId",
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
          parentId: 1,
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
                parentId: "$$ancestor.parentId",
                description: "$$ancestor.description",
                depth: "$$ancestor.depth",
              },
            },
          },
        },
      },
    ]);

    const rootCategory = result[0];
    const allCategories = [
      {
        _id: rootCategory._id,
        title: rootCategory.title,
        slug: rootCategory.slug,
        parentId: rootCategory.parentId,
        description: rootCategory.description,
        depth: 0,
      },
      ...rootCategory.hierarchy,
    ];

    // Build a nested parent hierarchy in reverse order
    const buildReverseTree = (categories, currentId) => {
      const tree = [];
      const currentCategory = categories.find((cat) => String(cat._id) === String(currentId));

      if (!currentCategory) {
        return tree;
      }

      const node = {
        _id: currentCategory._id,
        title: Object.fromEntries(new Map(Object.entries(currentCategory.title))),
        slug: currentCategory.slug,
        parentId: currentCategory.parentId,
        description: Object.fromEntries(new Map(Object.entries(currentCategory.description))),
        depth: currentCategory.depth || 0,
      };

      if (currentCategory.parentId) {
        const parentTree = buildReverseTree(categories, currentCategory.parentId);
        if (parentTree.length) {
          node.children = parentTree;
        }
      }

      tree.push(node);
      return tree;
    };

    return buildReverseTree(allCategories, this._id);
  } catch (err) {
    throw new Error(`Error fetching parent hierarchy: ${err.message}`);
  }
};


/* Get Child Hierarchy */
categorySchema.methods.getChildHierarchy = async function () {
  try {
    const Category = this.model("Category");

    const result = await Category.aggregate([
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

    const buildTree = (categories, parentId = null) => {
      const tree = [];
      categories.forEach((category) => {
        if (String(category.parentId) === String(parentId)) {
          const children = buildTree(categories, category._id);
          const node = {
            _id: category._id,
            title: Object.fromEntries(new Map(Object.entries(category.title))),
            slug: category.slug,
            parentId: category.parentId,
            description: Object.fromEntries(new Map(Object.entries(category.description))),
            depth: category.depth || 0,
          };
          if (children.length) {
            node.children = children;
          }
          tree.push(node);
        }
      });
      return tree;
    };

    const rootCategory = result[0];
    const allCategories = [
      {
        _id: rootCategory._id,
        title: rootCategory.title,
        slug: rootCategory.slug,
        parentId: rootCategory.parentId,
        description: rootCategory.description,
        depth: 0,
      },
      ...rootCategory.children,
    ];

    return buildTree(allCategories, this._id);
  } catch (err) {
    throw new Error(`Error fetching child hierarchy: ${err.message}`);
  }
};

categorySchema.methods.getLocalizedTitle = function (lang = 'en') {
  const titleMap = this.title;
  return titleMap.get(lang) || titleMap.get('en');
};

/* For All Image */
categorySchema.virtual('uploads', {
  ref: 'Upload',
  localField: '_id',
  foreignField: 'uploadsable_id',
  justOne: false,
  match: { uploadsable_type: 'Category', deletedAt: null }
});


categorySchema.virtual('category_image', {
  ref: 'Upload',
  localField: '_id',
  foreignField: 'uploadsable_id',
  justOne: true,
  match: { uploadsable_type: 'Category', type:'category_image', deletedAt: null },
  options: { sort: { createdAt: -1 } }
});

categorySchema.virtual('category_icon', {
  ref: 'Upload',
  localField: '_id',
  foreignField: 'uploadsable_id',
  justOne: true,
  match: { uploadsable_type: 'Category', type:'category_icon', deletedAt: null },
  options: { sort: { createdAt: -1 } }
});

categorySchema.set('toObject', { virtuals: true });
categorySchema.set('toJSON', { virtuals: true });

categorySchema.plugin(mongoosePaginate);
const Category = mongoose.model("Category", categorySchema, "categories");
module.exports = Category;
