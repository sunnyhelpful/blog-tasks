const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const slugify = require("slugify");
const { Mixed } = mongoose.Schema.Types;

const attributeSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: [
        "text",
        "number",
        "boolean",
        "radio",
        "radioimage",
        "radioimagetitle",
        "checkbox",
        "checkboximage",
        "checkboximagetitle",
        "date",
        "singleimageuploader",
        "multipleimageuploader",
        "singleselectdropdown",
        "singleselectdropdownwithsearch",
        "multipleselectdropdown",
        "multipleselectdropdownwithsearch",
        "toggleswitchtitle",
        "toggleswitchtitleinput",
        "googlemap",
        "textarea",
        "texteditor"
      ],
      required: true,
    },
    label: {
      type: Map,
      of: String,
      required: true,
    },
    placeholder: {
      type: Map,
      of: String,
      required: false,
    },
    options: {
      type: [
        {
          value: {
            type: Map,
            of: String,
            required: true
          },
          meta: {
            type: Mixed,
            default: {}
          }
        }
      ],
      default: []
    },
    isVerification: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
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
  
attributeSchema.pre("save", async function (next) {
  if (this.title && this.title.get("en")) {
    this.slug = await generateUniqueSlug(this.title.get("en"), this._id);
  }
  next();
});

async function generateUniqueSlug(title, attributeId = null) {
  const baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug, isDeleted: false };
    if (attributeId) {
      query._id = { $ne: attributeId };
    }

    const existing = await Attribute.findOne(query);
    if (!existing) break;

    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}

attributeSchema.methods.softDelete = function (deletedBy) {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  this.deletedBy = deletedBy;
  return this.save();
};


attributeSchema.plugin(mongoosePaginate);
const Attribute = mongoose.model("Attribute", attributeSchema, "attributes"); 
module.exports = Attribute;