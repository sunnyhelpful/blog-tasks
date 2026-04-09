module.exports = {
    transform(brand, lang = 'en') {
        return {
            id: brand._id,
            title: brand.title.get(lang),
            status: brand.status,
            createdAt: brand.createdAt,
            updatedAt: brand.updatedAt
        };
    },
    transformCollection(brands, lang = 'en') {
        return brands.map(brand => this.transform(brand, lang));
    }
};