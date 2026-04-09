const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const notificationSchema = new mongoose.Schema(
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
        notifyUrl: {
            type: String,
            default: null,
        },
        uploadsable_type: {
            type: String,
            required: false,
        },
        uploadsable_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: false,
        },
        notifyType: {
            type: String,
            enum: ['system', 'platform'],
            default: 'system',
        },
        type: {
            type: String,
            default: null,  /* Notification subtype */
        },
        deliveryStatus: {
            type: String,
            enum: ['pending', 'sent', 'failed'],
            default: 'pending',
        },
        deliveredAt: {
            type: Date,
            default: null,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        recipientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
            default: null,
        },
        isSeen: {
            type: Boolean,
            default: false,
        },
        seenAt: {
            type: Date,
            default: null,
        },
        clickCount: {
            type: Number,
            default: 0,
        },
        viewCount: {
            type: Number,
            default: 0,
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

notificationSchema.index({ recipientId: 1, isRead: 1, isDeleted: 1 });
notificationSchema.index({ createdAt: -1 });

notificationSchema.pre("save", async function (next) {
    if (this.isModified('deliveryStatus') && this.deliveryStatus === 'sent' && !this.deliveredAt) {
        this.deliveredAt = new Date();
    }
    next();
});

notificationSchema.methods = {
    softDelete: async function() {
        this.isDeleted = true;
        this.deletedAt = new Date();
        return this.save();
    },

    markAsRead: async function() {
        if (!this.isRead) {
            this.isRead = true;
            this.readAt = new Date();
            return this.save();
        }
        return this;
    },

    markAsSeen: async function() {
        if (!this.isSeen) {
            if (!this.isRead) {
                this.isRead = true;
                this.readAt = new Date();
            }
            this.isSeen = true;
            this.seenAt = new Date();
            return this.save();
        }
        return this;
    },

    incrementClick: async function() {
        this.clickCount = (this.clickCount || 0) + 1;
        return this.save();
    },

    incrementView: async function() {
        this.viewCount = (this.viewCount || 0) + 1;
        return this.save();
    }
};

notificationSchema.plugin(mongoosePaginate);

const Notification = mongoose.model("Notification", notificationSchema, "notifications");
module.exports = Notification;
