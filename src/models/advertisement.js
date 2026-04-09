const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const slugify = require("slugify");

const advertisementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        slug: {
            type: String,
            required: false,
        },
        status: {
            type: String,
            enum: ["active", "inactive", 'expired'],
            default: "active",
        },
        start_date: {
            type: Date,
            default: null,
        },
        end_date: {
            type: Date,
            default: null,
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
advertisementSchema.pre("save", async function (next) {
    if (this.title) {
        this.slug = await generateUniqueSlug(this.title, this._id);
    }

    if (this.isNew) {
        this.createdBy = this.createdBy || this.updatedBy;
    } else {
        this.updatedBy = this.updatedBy;
    }

    next();
});


advertisementSchema.methods.softDelete = function () {
    this.isDeleted = true;
    this.deletedAt = Date.now();
    return this.save();
};

async function generateUniqueSlug(title, advertisementId = null) {
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug, isDeleted: false };
        if (advertisementId) {
            query._id = { $ne: advertisementId };
        }

        const existing = await Advertisement.findOne(query);
        if (!existing) break;

        slug = `${baseSlug}-${counter++}`;
    }

    return slug;
}

advertisementSchema.plugin(mongoosePaginate);
const Advertisement = mongoose.model("Advertisement", advertisementSchema, "advertisements");
module.exports = Advertisement;
