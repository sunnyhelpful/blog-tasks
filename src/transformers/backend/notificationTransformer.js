module.exports = {
    transform(notification, lang = 'en') {
        return {
            id: notification._id,
            title: notification.title.get(lang) ? notification.title.get(lang) : notification.title.get('en'),
            description: notification.description.get(lang) ? notification.description.get(lang) : notification.description.get('en'),
            isRead: notification.isRead,
            url: notification.notifyUrl,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt
        };
    },

    transformCollection(notifications, lang = 'en') {
        return notifications.map(notification => this.transform(notification, lang));
    }
};
