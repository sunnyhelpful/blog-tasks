const constantKey = require('../../config/constant')
module.exports = {
    transform(tier, lang = 'en') {
        const tierName = constantKey.TIER.TIER_NUMBERS[tier.tierNumber] || 'Unknown Tier';
        const capitalizedTierName = tierName.charAt(0).toUpperCase() + tierName.slice(1);
        const transformed = {
            id: tier._id,
            title: tier.title.get(lang),
            status: tier.status,
            tierNumber: capitalizedTierName,
            applicableFeePercent: tier.applicableFeePercent,
            createdAt: tier.createdAt,
            updatedAt: tier.updatedAt
        };

        return transformed;
    },

    transformCollection(tiers, lang = 'en') {
        return tiers.map(tier => this.transform(tier, lang));
    }
};
