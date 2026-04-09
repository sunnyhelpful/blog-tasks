module.exports = {
    transform(category_type, lang = 'en') {
        const transformed = {
            id: category_type._id,
            title: category_type.title?.[lang] || category_type.title?.['en'] || '',
            slug: category_type.slug,
            createdAt: category_type.createdAt,
            updatedAt: category_type.updatedAt,
        };

        if (category_type.category_type_image && category_type.category_type_image.file_path) {
            transformed.image = {
                url: category_type.category_type_image.file_path,
                originalName: category_type.category_type_image.original_file_name,
                type: category_type.category_type_image.file_type,
            };
        }

        if (category_type.category_type_icon && category_type.category_type_icon.file_path) {
            transformed.icon = {
                url: category_type.category_type_icon.file_path,
                originalName: category_type.category_type_icon.original_file_name,
                type: category_type.category_type_icon.file_type,
            };
        }

        if (category_type.children && Array.isArray(category_type.children)) {
            transformed.children = category_type.children.map(child => this.transform(child, lang));
        }

        return transformed;
    },

    transformCollection(categories_type, lang = 'en') {
        return categories_type.map(category_type => this.transform(category_type, lang));
    }
};
