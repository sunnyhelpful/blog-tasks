const Upload = require('../models/upload');
const path = require('path');

async function saveUpload(storeId, schema, file, savefileType = null, isS3 = false) {
  if (!file) {
    throw new Error('No file provided');
  }

  let filePath, fileUrl;
  const {
    originalname: originalFileName,
    mimetype: fileType,
    filename,
    size
  } = file;

  if (isS3) {
    filePath = file.key;
    fileUrl = file.location;
  } else {
    const baseDir = path.join(__dirname, '..', '..');
    filePath = path.relative(baseDir, file.path).replace(/\\/g, '/');
    fileUrl = `/storage/${filePath}`;
  }

  const extension = path.extname(originalFileName).toLowerCase().slice(1);
  const type = savefileType || fileType.split('/')[0];

  const upload = new Upload({
    uploadsable_id: storeId,
    uploadsable_type: schema,
    file_path: filePath,
    original_file_name: originalFileName,
    type,
    file_type: fileType,
    extension,
    orientation: null,
  });

  await upload.save();
  return upload;
}

module.exports = {
  saveUpload
};