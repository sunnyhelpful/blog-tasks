const mongoose = require('mongoose');

const categoryAttributeSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    attributeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attribute',
        required: true
    },
    searchable: {
        type: Boolean,
        default: false
    },
    position: {
        type: Number,
        default: 0
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
}, {
    timestamps: true
});

/* categoryAttributeSchema.index(
    { categoryId: 1, attributeId: 1 },
    {
        unique: true,
        partialFilterExpression: {
        isDeleted: false
        }
    }
); */

categoryAttributeSchema.methods.softDelete = function (deletedBy) {
    this.isDeleted = true;
    this.deletedAt = Date.now();
    this.deletedBy = deletedBy;
    return this.save();
};

const CategoryAttribute = mongoose.model("CategoryAttribute", categoryAttributeSchema, "category_attributes");
module.exports = CategoryAttribute;