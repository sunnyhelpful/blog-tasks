module.exports = {
    transform(categoryType, lang = 'en') {
        return {
            id: categoryType.id,
            title: categoryType.title.get(lang),
            description: categoryType.description,
            slug: categoryType.slug,
            status: categoryType.status,
            createdAt: categoryType.createdAt,
            updatedAt: categoryType.updatedAt

            /* categoryTypeUploads: categoryType.categorytypeUploads.map(upload => ({
                id: upload.id,
                file_path: upload.file_path,
                original_file_name: upload.original_file_name,
                type: upload.type,
                file_type: upload.file_type,
                extension: upload.extension
            })), */
        };
    },

    transformCollection(categoryTypes, lang = 'en') {
        return categoryTypes.map(categoryType => this.transform(categoryType, lang));
    }
};