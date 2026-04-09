const mongoose = require("mongoose");

const rolePermissionSchema = new mongoose.Schema(
  {
    permission_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",  /* model name */
      required: true
    },
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",  /* model name */
      required: true
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
    timestamps: true
  }
);

rolePermissionSchema.virtual('fetch_permissions', {
  ref: 'Permission',
  localField: 'permission_id',
  foreignField: '_id',
  justOne: true,
  match: { deletedAt: null },
  options: { sort: { createdAt: -1 } }
});

rolePermissionSchema.set('toObject', { virtuals: true });
rolePermissionSchema.set('toJSON', { virtuals: true });

const RolePermission = mongoose.model("RolePermission", rolePermissionSchema, "role_has_permission");
module.exports = RolePermission;