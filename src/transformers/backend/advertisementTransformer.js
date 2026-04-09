module.exports = {
    transform(advertisement) {
        return {
            id: advertisement._id,
            title: advertisement.title.get(lang),
            status: advertisement.status,
            createdAt: advertisement.createdAt,
            updatedAt: advertisement.updatedAt
        };
    },

    transformCollection(advertisements) {
        return advertisements.map(advertisement => this.transform(advertisement, lang));
    }
};