const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const boostedListingTierSchema = new mongoose.Schema(
    {
        tier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tier",  /* model name */
            required: true
        },
        boostFee: {
            type: Number,
            required: true
        },
        boostDurationDays: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        deletedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        deletedAt: {
            type: Date,
            default: null
        },
    },
    {
        timestamps: true
    }
);

boostedListingTierSchema.plugin(mongoosePaginate);

const BoostedListingTier = mongoose.model("BoostedListingTier", boostedListingTierSchema, "boosted_listing_tiers");
module.exports = BoostedListingTier;
