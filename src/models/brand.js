const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const slugify = require('slugify');

const brandSchema = new mongoose.Schema({
    title: {
        type: Map,
        of: String,
        required: true,
    },
    description: {
        type: Map,
        of: String,
        required: false,
    },
    slug: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
    isVerification: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
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
    }
}, {
    timestamps: true,
});



brandSchema.pre("save", function (next) {
    if (this.title && this.title.get("en")) {
        this.title = slugify(this.title.get("en"), { lower: true, strict: true });
    }
    next();
});


brandSchema.methods.softDelete = function (deletedBy) {
    this.isDeleted = true;
    this.deletedAt = Date.now();
    this.deletedBy = deletedBy;
    return this.save();
};

/* For All Image */
brandSchema.virtual('uploads', {
    ref: 'Upload',
    localField: '_id',
    foreignField: 'uploadsable_id',
    justOne: false,
    match: { uploadsable_type: 'Brand', deletedAt: null }
});

brandSchema.virtual('brand_image', {
    ref: 'Upload',
    localField: '_id',
    foreignField: 'uploadsable_id',
    justOne: true,
    match: { uploadsable_type: 'Brand', type:'brand_image', deletedAt: null },
    options: { sort: { createdAt: -1 } }
});

brandSchema.virtual('brand_icon', {
    ref: 'Upload',
    localField: '_id',
    foreignField: 'uploadsable_id',
    justOne: true,
    match: { uploadsable_type: 'Brand', type:'brand_icon', deletedAt: null },
    options: { sort: { createdAt: -1 } }
});

brandSchema.set('toObject', { virtuals: true });
brandSchema.set('toJSON', { virtuals: true });

brandSchema.plugin(mongoosePaginate);
const Brand = mongoose.model("Brand", brandSchema, "brands"); 
module.exports = Brand;

