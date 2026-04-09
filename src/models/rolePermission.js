const mongoose = require("mongoose");

const rolePermissionSchema = new mongoose.Schema(
  {
    permission_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Permission",
      required: true,
    },
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
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

// Virtual to fetch permission details
rolePermissionSchema.virtual("fetch_permissions", {
  ref: "Permission",
  localField: "permission_id",
  foreignField: "_id",
  justOne: true,
  match: { deletedAt: null },
});

// Include virtuals
rolePermissionSchema.set("toObject", { virtuals: true });
rolePermissionSchema.set("toJSON", { virtuals: true });

// Optional: prevent duplicate role-permission pairs
rolePermissionSchema.index({ role_id: 1, permission_id: 1 }, { unique: true });

const RolePermission = mongoose.model(
  "RolePermission",
  rolePermissionSchema,
  "role_has_permission"
);

module.exports = RolePermission;