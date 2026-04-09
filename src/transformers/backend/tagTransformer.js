module.exports = {
    transform(tag, lang = 'en') {
        return {
            id: tag._id,
            title: tag.title.get(lang),
            description: tag.description.get(lang),
            tagType: tag.tagType,
            relatedTags: tag.relatedTags.map(tag => tag._id),
            metaTitle: tag.metaTitle,
            visibility: tag.visibility,
            priority: tag.priority,
            clickCount: tag.clickCount,
            status: tag.status,
            createdAt: tag.createdAt,
            updatedAt: tag.updatedAt,
        };
    },

    transformCollection(tags, lang = 'en') {
        return tags.map(tag => this.transform(tag, lang));
    }
};
