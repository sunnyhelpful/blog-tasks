const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const slugify = require("slugify");

const tierSchema = new mongoose.Schema(
    {
        title: {
            type: Map,
            of: String,
            required: true,
        },
        slug: {
            type: String,
            required: false,
        },
        description: {
            type: Map,
            of: String,
            default: {},
        },
        tierNumber: {
            type: Number,
            required: true,
            enum: [0, 1, 2, 3], // 0: Suspended, 1: Standard, 2: Gold, 3: Diamond
        },
        maxPostedListings: {
            type: Number,
            required: true,
        },
        listingDurationDays: {
            type: Number,
            required: true,
        },
        annualSubscription: {
            type: Number,
            required: true,
        },
        applicableFeePercent: {
            type: Number,
            required: true,
        },
        maxFee: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },
        isDeleted: {
            type: Boolean,
            default: false,
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
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

tierSchema.pre("save", function (next) {
  if (this.title && this.title.get("en")) {
    this.slug = slugify(this.title.get("en"), { lower: true, strict: true });
  }
  next();
});

tierSchema.methods.softDelete = function (deletedBy) {
    this.isDeleted = true;
    this.deletedAt = Date.now();
    this.deletedBy = deletedBy;
    return this.save();
};

tierSchema.plugin(mongoosePaginate);

const Tier = mongoose.model("Tier", tierSchema, "tiers");
module.exports = Tier;
