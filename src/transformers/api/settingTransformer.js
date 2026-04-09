module.exports = {
    transform(setting, lang = 'en') {
        const getValue = (field) => {
            if (!setting[field]) return '';
            return setting[field][lang] || setting[field]['en'] || '';
        };
 
        return {
            id: setting._id,
            slug: setting.slug,
            key: setting.key,
            value: getValue('value'),
            type: setting.type,
            details: getValue('details'),
            display_name: getValue('display_name'),
            status: setting.status,
            createdAt: setting.createdAt,
            updatedAt: setting.updatedAt
        };
    },
 
    transformCollection(settings, lang = 'en') {
        const transformedSettings = settings.map(setting => this.transform(setting, lang));
 
        const social_media = {};
        const contact_information = {};
        transformedSettings.forEach(item => {
            if (item.key.startsWith('social_')) {
                const socialKey = item.key.replace('social_', '');
                social_media[socialKey] = item.value;
            } else if(item.key.startsWith('contact_support') || item.key.startsWith('office')) {
                const contactKey = item.key.replace('contact_support_', '');
                contact_information[contactKey] = item.value;
            }
        });
 
        return {
            all: transformedSettings,
            social_media,
            contact_information
        };
    }
};