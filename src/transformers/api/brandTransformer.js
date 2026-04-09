module.exports = {
    transform(brand, lang = 'en') {
        const transformed = {
            id: brand._id,
            title: brand.title?.[lang] || brand.title?.['en'] || '',
            status: brand.status,
            createdAt: brand.createdAt,
            updatedAt: brand.updatedAt
        };

        if (brand.brand_image && brand.brand_image.file_path) {
            transformed.image = {
                url: brand.brand_image.file_path,
                originalName: brand.brand_image.original_file_name,
                type: brand.brand_image.file_type
            };
        }

        if (brand.brand_icon && brand.brand_icon.file_path) {
            transformed.icon = {
                url: brand.brand_icon.file_path,
                originalName: brand.brand_icon.original_file_name,
                type: brand.brand_icon.file_type
            };
        }

        return transformed;
    },

    transformCollection(brands, lang = 'en') {
        return brands.map(brand => this.transform(brand, lang));
    }
};
