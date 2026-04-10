const multer = require('multer');

const handleMulterError = (maxSizeMB = 5) => {
  return (err, req, res, next) => {
    const t = req.t || ((str, vars) => str.replace(/:num/, vars?.num || maxSizeMB));
    const fieldName = err?.field || 'file';

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: t('The uploaded file is too large. Max size is :num MB.', {
            num: maxSizeMB,
          }),
          error: {
            [fieldName]: t('File size should not exceed :num MB.', {
              num: maxSizeMB,
            }),
          },
        });
      }

      return res.status(400).json({
        message: t('File upload error.'),
        error: { [fieldName]: err.message },
      });
    }

    if (err) {
      return res.status(500).json({
        message: t('Unexpected error during file upload.', {
          attribute: fieldName,
        }),
        error: { [fieldName]: err.message },
      });
    }

    next();
  };
};

module.exports = handleMulterError;