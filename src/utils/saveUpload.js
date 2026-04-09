const Upload = require('../models/upload');
const path = require('path');

async function saveUpload(storeId, schema, file, savefileType = null, isS3 = false) {
  if (!file) {
    throw new Error('No file provided');
  }

  const {
    originalname: originalFileName,
    mimetype: fileType,
    filename,
    size,
    path: fileFullPath,
  } = file;

  const baseDir = path.join(__dirname, '..', '..');

  let filePath = path.relative(baseDir, fileFullPath).replace(/\\/g, '/');
  let fileUrl = `/${filePath}`;

  const extension = path.extname(originalFileName).toLowerCase().slice(1);
  const type = savefileType || fileType.split('/')[0];

  const upload = new Upload({
    uploadsable_id: storeId,
    uploadsable_type: schema,
    file_path: filePath,
    file_url: fileUrl,
    original_file_name: originalFileName,
    type,
    file_type: fileType,
    extension,
    orientation: null,
    size,
  });

  await upload.save();
  return upload;
}

module.exports = {
  saveUpload,
};