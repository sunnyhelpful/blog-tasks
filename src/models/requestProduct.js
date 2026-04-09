const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const requestProductSchema = new mongoose.Schema(
  {
    /* categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ], */
    main_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    sub_category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "fulfilled", "cancelled"],
      default: "pending",
    },
    description: {
      type: String,
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
  { timestamps: true }
);

requestProductSchema.plugin(mongoosePaginate);
const RequestProduct = mongoose.model("RequestProduct", requestProductSchema, "request_products");
module.exports = RequestProduct;
