module.exports = {
    transform(advertisement) {
        return {
            id: advertisement._id,
            title: advertisement.title,
            createdAt: advertisement.createdAt,
            updatedAt: advertisement.updatedAt
        };
    },

    transformCollection(advertisements) {
        return advertisements.map(advertisement => this.transform(advertisement));
    }
};