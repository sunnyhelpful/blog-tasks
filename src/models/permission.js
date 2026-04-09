const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const permissionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      default: null,
      trim: true,
    },
    module: {
      type: String,
      required: true,
      trim: true,
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

permissionSchema.plugin(mongoosePaginate);

const Permission = mongoose.model("Permission", permissionSchema, "permissions");

module.exports = Permission;