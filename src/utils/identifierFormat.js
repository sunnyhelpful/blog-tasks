const mongoose = require('mongoose');

/**
 * Returns a MongoDB query condition based on whether the input is an ObjectId or a slug.
 * @param {string} idOrSlug - The identifier which can be a MongoDB ObjectId or a slug.
 * @returns {Object} MongoDB query condition
 */
function formatIdentifierCondition(idOrSlug) {
    const isValidObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);
    return isValidObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
}

module.exports = formatIdentifierCondition;
