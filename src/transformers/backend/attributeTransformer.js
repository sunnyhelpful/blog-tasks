module.exports = {
    transform(advertisement, lang = 'en') {
        return {
            id: advertisement._id,
            title: advertisement.title.get(lang),
            type: advertisement.type,
            status: advertisement.status,
            createdAt: advertisement.createdAt,
            updatedAt: advertisement.updatedAt
        };
    },

    transformCollection(advertisements, lang = 'en') {
        return advertisements.map(advertisement => this.transform(advertisement, lang));
    }
};