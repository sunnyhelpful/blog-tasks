const categoryType = require('../../models/categoriesType');
const User = require('../../models/user');

const categoriesTypeSeeder = async () => {
    try {
        const adminUser = await User.findOne({ email: 'admin@gmail.com', isDeleted: false });
        const adminId = adminUser?._id;

        if (!adminId) {
            console.error('Admin user not found.');
            return;
        }

        const categoryTypes = [
            {
                title: {
                    en: 'Jobs',
                    ar: 'وظائف',
                },
                description: {
                    en: 'This category covers job listings and employment opportunities.',
                    ar: 'تغطي هذه الفئة قوائم الوظائف وفرص العمل.',
                },
                status: 'active',
                category_type: 'category_type',
                isVerification: 'approved',
                createdBy: adminId,
            },
            {
                title: {
                    en: 'Community',
                    ar: 'مجتمع',
                },
                description: {
                    en: 'This category includes community-related topics and discussions.',
                    ar: 'تتضمن هذه الفئة مواضيع ومناقشات متعلقة بالمجتمع.',
                },
                status: 'active',
                category_type: 'category_type',
                isVerification: 'approved',
                createdBy: adminId,
            },
            {
                title: {
                    en: 'Service',
                    ar: 'خدمة',
                },
                description: {
                    en: 'This category includes all service-related offerings.',
                    ar: 'تتضمن هذه الفئة جميع العروض المتعلقة بالخدمة',
                },
                category_type: 'category_type',
                isVerification: 'approved',
                status: 'active',
                createdBy: adminId,
            },
            {
                title: {
                    en: 'Product',
                    category_type: 'category_type',
                    isVerification: 'approved',
                    ar: 'منتج',
                },
                description: {
                    en: 'This category includes product listings and reviews.',
                    ar: 'تتضمن هذه الفئة قوائم المنتجات والمراجعات.',
                },
                status: 'active',
                category_type: 'category_type',
                isVerification: 'approved',
                createdBy: adminId,
            },
        ];

        for (const catType of categoryTypes) {
            const existingCategoryType = await categoryType.findOne({
                $or: [
                    { 'title.en': catType.title.en },
                    { 'title.ar': catType.title.ar },
                ],
                isDeleted: false,
            });

            if (!existingCategoryType) {
                await categoryType.create(catType);
                console.log(`Created category: ${catType.title.en}`);
            } else {
                console.log(`Category '${catType.title.en}' or '${catType.title.ar}' already exists.`);
            }
        }

        console.log('CategoriesType have been seeded successfully!');
    } catch (error) {
        console.error('Error seeding categories type:', error);
    }
};

module.exports = categoriesTypeSeeder;
