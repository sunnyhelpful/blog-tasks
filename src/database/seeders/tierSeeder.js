const mongoose = require('mongoose');
const User = require('../../models/user');
const Tier = require('../../models/tier');

const tierSeeder = async () => {
    try {
        const adminUser = await User.findOne({ email: 'admin@gmail.com', isDeleted: false });
        const adminId = adminUser?._id;

        if (!adminId) {
            console.error('Admin user not found.');
            return;
        }

        const tiers = [
            {
                title: {
                    en: 'Tier 0',
                    ar: 'الفئة 0',
                },
                description: {
                    en: 'Can buy but cannot sell.',
                    ar: 'يمكن الشراء ولكن لا يمكن البيع.',
                },
                tierNumber: 0,
                maxPostedListings: 0,
                listingDurationDays: 0,
                annualSubscription: 0,
                applicableFeePercent: 1.0,
                maxFee: 5000,
                status: 'active',
                createdBy: adminId,
            },
            {
                title: {
                    en: 'Tier 1',
                    ar: 'الفئة 1',
                },
                description: {
                    en: 'Can buy and sell.',
                    ar: 'يمكن الشراء والبيع.',
                },
                tierNumber: 1,
                maxPostedListings: 11,
                listingDurationDays: 90,
                annualSubscription: 0,
                applicableFeePercent: 1.0,
                maxFee: 199,
                status: 'active',
                createdBy: adminId,
            },
            {
                title: {
                    en: 'Tier 2',
                    ar: 'الفئة 2',
                },
                description: {
                    en: 'Can buy and sell.',
                    ar: 'يمكن الشراء والبيع.',
                },
                tierNumber: 2,
                maxPostedListings: 33,
                listingDurationDays: 180,
                annualSubscription: 99,
                applicableFeePercent: 0.25,
                maxFee: 99,
                status: 'active',
                createdBy: adminId,
            },
            {
                title: {
                    en: 'Tier 3',
                    ar: 'الفئة 3',
                },
                description: {
                    en: 'Can buy and sell.',
                    ar: 'يمكن الشراء والبيع.',
                },
                tierNumber: 3,
                maxPostedListings: 999,
                listingDurationDays: 365,
                annualSubscription: 199,
                applicableFeePercent: 0.1,
                maxFee: 49,
                status: 'active',
                createdBy: adminId,
            },
        ];


        for (const tier of tiers) {
            const existingTier = await Tier.findOne({
                tierNumber: tier.tierNumber,
                isDeleted: false,
            });

            if (!existingTier) {
                await Tier.create(tier);
                console.log(`Created tier: ${tier.title.en}`);
            } else {
                console.log(`Tier '${tier.title.en}' already exists.`);
            }
        }

        console.log('Tiers have been seeded successfully!');
    } catch (error) {
        console.error('Error seeding tiers:', error);
    }
};

module.exports = tierSeeder;
