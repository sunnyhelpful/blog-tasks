module.exports = {
    transform(setting, lang = 'en') {
        return {
            id: setting.id,
            details: setting.details.get(lang),
            status: setting.status,
            createdAt: setting.createdAt,
            updatedAt: setting.updatedAt
        };
    },
  
    transformCollection(settings, lang = 'en') {
        return settings.map(setting => this.transform(setting, lang));
    }
};