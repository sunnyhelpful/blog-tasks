const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const permissionSchema = new mongoose.Schema(
  {
    title: {
      type: Map,
      of: String,
      required: true,
    },
    name: {
      type: String,
      default: null,
    },
    module: {
      type: Map,
      of: String,
      required: true,
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
