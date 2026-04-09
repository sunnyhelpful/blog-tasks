const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const reviewSchema = new mongoose.Schema(
    {
        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },
        rating: {
            type: Number,
            required: true,
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"],
            validate: {
                validator: Number.isInteger,
                message: "Rating must be a whole number"
            }
        },
        description: {
            type: Map,
            of: String,
            required: false,
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
    {
        timestamps: true,
    }
);

/* Pre-save hooks */
reviewSchema.pre("save", async function (next) {
    
    next();
});

reviewSchema.index({ productId: 1, reviewerId: 1 }, { unique: true });

reviewSchema.index({ sellerId: 1, status: 1 });
reviewSchema.index({ productId: 1, status: 1 });

reviewSchema.virtual('reviewer', {
    ref: 'User',
    localField: 'reviewerId',
    foreignField: '_id',
    justOne: true,
    options: { select: 'first_name middle_name last_name' }
});

reviewSchema.virtual('seller', {
    ref: 'User',
    localField: 'sellerId',
    foreignField: '_id',
    justOne: true,
    options: { select: 'first_name middle_name last_name' }
});

reviewSchema.virtual('product', {
    ref: 'Product',
    localField: 'productId',
    foreignField: '_id',
    justOne: true,
    options: { select: 'title' }
});

reviewSchema.methods.softDelete = function(deletedBy) {
    this.isDeleted = true;
    this.deletedAt = Date.now();
    this.deletedBy = deletedBy;
    return this.save();
};

reviewSchema.statics.getSellerRating = async function(sellerId) {
    const result = await this.aggregate([
        {
            $match: {
                sellerId: sellerId,
                isDeleted: false
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 },
                fiveStar: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
                fourStar: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
                threeStar: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
                twoStar: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
                oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } }
            }
        }
    ]);

    return result[0] ? {
        average: parseFloat(result[0].averageRating.toFixed(1)),
        total: result[0].totalReviews,
        breakdown: {
            5: result[0].fiveStar,
            4: result[0].fourStar,
            3: result[0].threeStar,
            2: result[0].twoStar,
            1: result[0].oneStar
        }
    } : {
        average: 0,
        total: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
};

reviewSchema.statics.getProductRating = async function(productId) {
    const result = await this.aggregate([
        {
            $match: {
                productId: productId,
                isDeleted: false
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 }
            }
        }
    ]);

    return result[0] ? {
        average: parseFloat(result[0].averageRating.toFixed(1)),
        total: result[0].totalReviews
    } : {
        average: 0,
        total: 0
    };
};


reviewSchema.set('toObject', { virtuals: true });
reviewSchema.set('toJSON', { virtuals: true });

reviewSchema.plugin(mongoosePaginate);
const Review = mongoose.model("Review", reviewSchema, "reviews");
module.exports = Review;
