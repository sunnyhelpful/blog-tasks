const mongoose = require("mongoose");

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
  },
  {
    timestamps: true,
  },
);

BlogSchema.virtual("blogImages", {
  ref: "Upload",
  localField: "_id",
  foreignField: "uploadsable_id",
  justOne: false,
  match: {
    uploadsable_type: "Blog",
    deletedAt: null,
  },
});

module.exports = mongoose.model("Blog", BlogSchema);
