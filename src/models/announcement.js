const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const slugify = require("slugify");
const { formatDate } = require('../utils/helper');
const constant = require('../config/constant');

const announcementSchema = new mongoose.Schema(
  {
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
announcementSchema.pre("save", async function (next) {
    if (this.title && this.title.get("en")) {
        this.slug = await generateUniqueSlug(this.title.get("en"), this._id);
    }

    if (this.isNew) {
        this.createdBy = this.createdBy || this.updatedBy;
    } else {
        this.updatedBy = this.updatedBy;
    }

    next();
});

announcementSchema.methods.softDelete = function (deletedBy) {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  this.deletedBy = deletedBy;
  return this.save();
};

async function generateUniqueSlug(title, announcementId = null) {
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug, isDeleted: false };
        if (announcementId) {
            query._id = { $ne: announcementId };
        }

        const existing = await Announcement.findOne(query);
        if (!existing) break;

        slug = `${baseSlug}-${counter++}`;
    }

    return slug;
}

announcementSchema.virtual('start_date_formatted').get(function () {
  const date = new Date(this.start_date);
  if (isNaN(date.getTime())) {
      return null;
  }
  
  const formattedDate = formatDate(date, constant.DATE_FORMAT[2]);
  return formattedDate;
});

announcementSchema.virtual('end_date_formatted').get(function () {
  const date = new Date(this.end_date);
  if (isNaN(date.getTime())) {
      return null;
  }
  
  const formattedDate = formatDate(date, constant.DATE_FORMAT[2]);
  return formattedDate;
});


announcementSchema.set('toObject', { virtuals: true });
announcementSchema.set('toJSON', { virtuals: true });

announcementSchema.plugin(mongoosePaginate);
const Announcement = mongoose.model("Announcement", announcementSchema, "announcements");
module.exports = Announcement;
