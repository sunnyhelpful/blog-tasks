const Upload = require('../models/upload');

/**
 * Get all files for a specific model
 * @param {String} modelId - ObjectId string of the entity
 * @param {String} modelType - Schema name (e.g., 'Category')
 * @param {String|null} fileType - Optional filter (e.g., 'category_image')
 */
async function fetchUpload(modelId, modelType, fileType = null) {
  const query = {
    uploadsable_id: modelId,
    uploadsable_type: modelType,
    deletedAt: null,
  };

  if (fileType) {
    query.type = fileType;
  }

  const uploads = await Upload.find(query).sort({ createdAt: -1 });

  return uploads;
}

module.exports = {
  fetchUpload,
};
