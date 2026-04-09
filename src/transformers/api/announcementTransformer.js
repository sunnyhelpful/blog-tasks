module.exports = {
    transform(announcement, lang = 'en') {
        return {
            id: announcement._id,
            title: announcement.title?.[lang] || announcement.title?.['en'] || '',
            createdAt: announcement.createdAt,
            updatedAt: announcement.updatedAt
        };
    },
    
    transformCollection(announcements, lang = 'en') {
        return announcements.map(announcement => this.transform(announcement, lang));
    }
};