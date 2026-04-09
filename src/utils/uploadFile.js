const fs = require('fs');
const multer = require('multer');
const path = require('path');

const ensureDirectoryExistence = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/* Common file type handler */
const getAllowedTypes = (fileType) => {
    switch (fileType) {
        case 'image':
            return /jpeg|jpg|png|gif/;
        case 'video':
            return /mp4|mkv|avi|mov/;
        case 'pdf':
            return /pdf/;
        case 'document':
            return /doc|docx|xls|xlsx|ppt|pptx/;
        case 'excel':
            return /xls|xlsx|csv/;
        default:
            throw new Error('Unsupported file type');
    }
};

/* Create disk storage */
const createDiskStorage = (folder) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadPath = path.join(__dirname, `../../public/storage/${folder}`);
            ensureDirectoryExistence(uploadPath);
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueName = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
            cb(null, uniqueName);
        },
    });
};

/* File filter */
const createFileFilter = (allowedTypes, fileType) => {
    return (req, file, cb) => {
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error(`Only ${fileType} files are allowed`), false);
        }
    };
};

/* Single / Array Upload */
const uploadFile = (
    fileFieldName,
    fileType = 'image',
    folder = 'uploads',
    sizeMB = 100,
    maxCount = 1
) => {
    const allowedTypes = getAllowedTypes(fileType);

    const upload = multer({
        storage: createDiskStorage(folder),
        limits: { fileSize: sizeMB * 1024 * 1024 },
        fileFilter: createFileFilter(allowedTypes, fileType),
    });

    return maxCount === 1
        ? upload.single(fileFieldName)
        : upload.array(fileFieldName, maxCount);
};

/* Multiple Fields Upload */
const multiUploadFiles = (
    fields = [],
    fileType = 'image',
    folder = 'uploads',
    sizeMB = 100
) => {
    const allowedTypes = getAllowedTypes(fileType);

    return multer({
        storage: createDiskStorage(folder),
        limits: { fileSize: sizeMB * 1024 * 1024 },
        fileFilter: createFileFilter(allowedTypes, fileType),
    }).fields(fields);
};

module.exports = { uploadFile, multiUploadFiles };