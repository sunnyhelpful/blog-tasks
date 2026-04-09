const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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

roleSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

roleSchema.virtual('role_permissions', {
  ref: 'RolePermission',
  localField: '_id',
  foreignField: 'role_id',
  justOne: false,
  match: { deletedAt: null },
  options: { sort: { createdAt: -1 } }
});

roleSchema.set('toObject', { virtuals: true });
roleSchema.set('toJSON', { virtuals: true });

roleSchema.plugin(mongoosePaginate);
const Role = mongoose.model("Role", roleSchema, "roles");
module.exports = Role;