const Notification = require('../models/notification');
const { saveUpload } = require('./saveUpload');

const saveNotification = async (req, res) => {
    try {
        const {
            title_en,
            title_ar,
            description_en,
            description_ar,
            notifyUrl,
            uploadsable_type,
            uploadsable_id,
            notifyType,
            type,  // sub_type
            senderId,
            recipientId,
        } = req.body;

        const title = {
            en: title_en,
            ar: title_ar
        };

        const description = {
            en: description_en || null,
            ar: description_ar || null
        };

        const data = {
            title,
            description,
            notifyUrl: notifyUrl || null,
            uploadsable_type,
            uploadsable_id,
            notifyType: notifyType || 'platform',
            type,
            senderId,
            recipientId,
        };

        const store = await Notification.create(data);

        if (store && req.files) {
            const isS3 = !!process.env.AWS_SDK_API_KEY && !!process.env.AWS_SDK_API_SECRET_KEY;

            for (const [fieldName, fileArray] of Object.entries(req.files)) {
                if (Array.isArray(fileArray)) {
                    for (const file of fileArray) {
                        await saveUpload(store._id, 'Notification', file, fieldName, isS3);
                    }
                }
            }
        }

        return store;
    } catch (error) {
        console.error('Error saving notification:', error);
        return false;
    }
};

module.exports = saveNotification;

