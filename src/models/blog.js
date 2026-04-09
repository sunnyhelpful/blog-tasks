const mongoose = require("mongoose");
const slugify = require("slugify");

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    externalImageUrl: {
      type: String,
      trim: true,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

BlogSchema.pre("validate", async function (next) {
  if (this.title && !this.slug) {
    this.slug = await generateUniqueSlug(this.title, this._id);
  }
  next();
});

BlogSchema.virtual("blogImages", {
  ref: "Upload",
  localField: "_id",
  foreignField: "uploadsable_id",
  justOne: true,
  match: {
    uploadsable_type: "Blog",
    deletedAt: null,
  },
});

async function generateUniqueSlug(title, blogId = null) {
  const baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (blogId) {
      query._id = { $ne: blogId };
    }

    const existing = await mongoose.model("Blog").findOne(query);
    if (!existing) break;

    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
}

module.exports = mongoose.model("Blog", BlogSchema);
