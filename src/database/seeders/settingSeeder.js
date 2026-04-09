const Setting = require('../../models/setting');
const User = require('../../models/user');

const settingsSeeder = async () => {
    try {
        const adminUser = await User.findOne({ email: 'admin@gmail.com' });
        const adminId = adminUser?._id;

        const settings = [
            {
                key: 'site_title',
                value: { en: 'Kanzy', ar: 'كانزي' },
                type: 'string',
                display_name: { en: 'Site Title', ar: 'عنوان الموقع' },
                group: 'web',
                details: { en: 'Site Title', ar: 'عنوان الموقع' },
                status: 1,
                createdBy: adminId,
            },
            {
                key: 'site_logo',
                value: { en: '', ar: '' },
                type: 'image',
                display_name: { en: 'Site Logo', ar: 'شعار الموقع' },
                group: 'web',
                details: { en: 'Site Logo', ar: 'شعار الموقع' },
                status: 1,
                createdBy: adminId,
            },
            {
                key: 'favicon',
                value: { en: '', ar: '' },
                type: 'image',
                display_name: { en: 'Favicon Icon', ar: 'أيقونة الموقع' },
                group: 'web',
                details: { en: 'Favicon Icon', ar: 'أيقونة الموقع' },
                status: 1,
                createdBy: adminId,
            },
            {
                key: 'office_location',
                value: { en: '4648 Rocky, New York', ar: '٤٦٤٨ روكي، نيويورك' },
                type: 'string',
                display_name: { en: 'Office Location', ar: 'موقع المكتب' },
                group: 'web',
                details: { en: 'Office Location', ar: 'موقع المكتب' },
                status: 1,
                createdBy: adminId,
            },
            {
                key: 'privacy_policy',
                value: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
                type: 'text',
                display_name: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
                group: 'api',
                details: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
                status: 1,
                createdBy: adminId,
            },
            {
                key: 'terms_and_conditions',
                value: { en: 'Terms and Conditions', ar: 'الشروط والأحكام' },
                type: 'text',
                display_name: { en: 'Terms and Conditions', ar: 'الشروط والأحكام' },
                group: 'api',
                details: { en: 'Terms and Conditions', ar: 'الشروط والأحكام' },
                status: 1,
                createdBy: adminId,
            },
            {
                key: 'about_us',
                value: { en: 'About Us', ar: 'من نحن' },
                type: 'text',
                display_name: { en: 'About Us', ar: 'من نحن' },
                group: 'api',
                details: { en: 'About Us', ar: 'من نحن' },
                status: 1,
                createdBy: adminId,
            },
            {
                key: 'contact_support_email',
                value: { en: 'support@kanzy.com', ar: 'support@kanzy.com' },
                type: 'string',
                display_name: { en: 'Support Email', ar: 'البريد الإلكتروني للدعم' },
                group: 'api',
                details: { en: 'Contact Support Email', ar: 'البريد الإلكتروني للدعم' },
                status: 1,
                createdBy: adminId,
            },
            {
                key: 'contact_support_phone',
                value: { en: '+1 800-123-4567', ar: '+١ ٨٠٠-١٢٣-٤٥٦٧' },
                type: 'string',
                display_name: { en: 'Support Phone', ar: 'رقم هاتف الدعم' },
                group: 'api',
                details: { en: 'Contact Support Phone Number', ar: 'رقم هاتف الدعم' },
                status: 1,
                createdBy: adminId,
            },
            {
                key: 'social_linkedin',
                value: { en: 'https://www.linkedin.com/company/kanzy', ar: 'https://www.linkedin.com/company/kanzy' },
                type: 'string',
                display_name: { en: 'LinkedIn', ar: 'لينكد إن' },
                group: 'web',
                details: { en: 'Official LinkedIn URL', ar: 'رابط لينكد إن الرسمي' },
                status: 1,
                createdBy: adminId,
            },
            {
                key: 'social_facebook',
                value: { en: 'https://www.facebook.com/kanzy', ar: 'https://www.facebook.com/kanzy' },
                type: 'string',
                display_name: { en: 'Facebook', ar: 'فيسبوك' },
                group: 'web',
                details: { en: 'Official Facebook URL', ar: 'رابط فيسبوك الرسمي' },
                status: 1,
                createdBy: adminId,
            },
            {
                key: 'social_instagram',
                value: { en: 'https://www.instagram.com/kanzy', ar: 'https://www.instagram.com/kanzy' },
                type: 'string',
                display_name: { en: 'Instagram', ar: 'انستغرام' },
                group: 'web',
                details: { en: 'Official Instagram URL', ar: 'رابط انستغرام الرسمي' },
                status: 1,
                createdBy: adminId,
            },
            {
                key: 'social_twitter',
                value: { en: 'https://twitter.com/kanzy', ar: 'https://twitter.com/kanzy' },
                type: 'string',
                display_name: { en: 'Twitter (X)', ar: 'تويتر (إكس)' },
                group: 'web',
                details: { en: 'Official Twitter (X) URL', ar: 'رابط تويتر (إكس) الرسمي' },
                status: 1,
                createdBy: adminId,
            },
            {
                key: 'social_tiktok',
                value: {
                    en: 'https://www.tiktok.com/@kanzy',
                    ar: 'https://www.tiktok.com/@kanzy'
                },
                type: 'string',
                display_name: {
                    en: 'TikTok',
                    ar: 'تيك توك'
                },
                group: 'web',
                details: {
                    en: 'Official TikTok URL',
                    ar: 'رابط تيك توك الرسمي'
                },
                status: 1,
                createdBy: adminId
            },
            {
                key: 'social_snapchat',
                value: {
                    en: 'https://www.snapchat.com/add/kanzy',
                    ar: 'https://www.snapchat.com/add/kanzy'
                },
                type: 'string',
                display_name: {
                    en: 'Snapchat',
                    ar: 'سناب شات'
                },
                group: 'web',
                details: {
                    en: 'Official Snapchat URL',
                    ar: 'رابط سناب شات الرسمي'
                },
                status: 1,
                createdBy: adminId
            }


        ];

        for (const setting of settings) {
            const existingSetting = await Setting.findOne({ key: setting.key });
            if (!existingSetting) {
                await Setting.create(setting);
                console.log(`Created: '${setting.key}'`);
            } else {
                console.log(`Exists: '${setting.key}'`);
            }
        }

        console.log('All multilingual settings have been seeded sequentially and successfully!');
    } catch (error) {
        console.error('Error seeding settings:', error);
    }
};

module.exports = settingsSeeder;