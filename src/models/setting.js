const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const slugify = require('slugify');

const settingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
        },
        value: {
            type: Map,
            of: String,
            required: true,
        },
        type: {
            type: String,
        },
        display_name: {
            type: Map,
            of: String,
            required: true,
        },
        slug: {
            type: String,
            unique: true,
        },
        details: {
            type: Map,
            of: String,
            required: true,
        },
        status: {
            type: Number,
            default: 1,
            enum: [0, 1],
        },
        group: {
            type: String,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        }
    },
    {
        timestamps: true,
    }
);

settingSchema.pre('save', async function (next) {
    if (this.isModified('details') && this.details?.get("en")) {
        this.slug = await generateUniqueSlug(this.details.get("en"), this._id);
    }        
    next();
});

settingSchema.methods.getLocalizedField = function (field, lang = 'en') {
    const value = this[field];
    if (value instanceof Map) {
        return value.get(lang) || value.get('en') || '';
    } else if (value && typeof value === 'object' && typeof value.get === 'function') {
        return value.get(lang) || value.get('en') || '';
    }
    return '';
};

async function generateUniqueSlug(title, settingId = null) {
    const baseSlug = slugify(title, { lower: true });
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug, deletedAt: null };
        if (settingId) {
            query._id = { $ne: settingId };
        }

        const existing = await mongoose.models.Setting.findOne(query);
        if (!existing) break;

        slug = `${baseSlug}-${counter}`;
        counter++;
    }

    return slug;
}

/* For All Image */
settingSchema.virtual('uploads', {
    ref: 'Upload',
    localField: '_id',
    foreignField: 'uploadsable_id',
    justOne: false,
    match: { uploadsable_type: 'Setting', deletedAt: null },
    options: { sort: { createdAt: -1 } }
});

/* Soft delete user */
settingSchema.methods.softDelete = function (createdBy) {
    this.isDeleted = true;
    this.deletedAt = Date.now();
    this.createdBy = createdBy;
    return this.save();
};

settingSchema.set('toObject', { virtuals: true });
settingSchema.set('toJSON', { virtuals: true });
  
settingSchema.plugin(mongoosePaginate);
const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;
