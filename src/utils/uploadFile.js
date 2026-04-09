const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { s3Client } = require('../config/aws');
const multerS3 = require('multer-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { S3 } = require('@aws-sdk/client-s3');

const ensureDirectoryExistence = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/* For Single image in one form and array */
const uploadFile = (fileFieldName, fileType = 'image', folder = 'uploads', sizeMB = 100, maxCount = 1) => {
    let allowedTypes;
    console.log(`Uploading ${fileFieldName} of type ${fileType} to ${folder}`);
    switch (fileType) {
        case 'image':
            allowedTypes = /jpeg|jpg|png|gif/;
            break;
        case 'video':
            allowedTypes = /mp4|mkv|avi|mov/;
            break;
        case 'pdf':
            allowedTypes = /pdf/;
            break;
        case 'document':
            allowedTypes = /doc|docx|xls|xlsx|ppt|pptx/;
            break;
        case 'excel':
            allowedTypes = /xls|xlsx|csv/;
            break;
        default:
            throw new Error('Unsupported file type');
    }

    const fileFilter = (req, file, cb) => {
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname || mimetype) {
            return cb(null, true);
        } else {
            return cb(new Error(`Only ${fileType} files are allowed`), false);
        }
    };

    let storage;
    if (process.env.AWS_SDK_API_KEY && process.env.AWS_SDK_API_SECRET_KEY) {
        storage = multerS3({
            s3: new S3({
                region: 'ap-northeast-1',
                credentials: {
                    accessKeyId: process.env.AWS_SDK_API_KEY,
                    secretAccessKey: process.env.AWS_SDK_API_SECRET_KEY,
                },
            }),
            bucket: process.env.AWS_S3_BUCKET_NAME || 'aws-bucket-name',
            key: function (req, file, cb) {
                cb(null, `${Date.now()}_${file.originalname}`);
            },
        });

    } else {
        storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = path.join(__dirname, `../../public/storage/${folder}`);
                ensureDirectoryExistence(uploadPath);
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                cb(null, `${Date.now()}_${file.originalname}`);
            },
        });
    }

    const upload = multer({
        storage,
        limits: { fileSize: sizeMB * 1024 * 1024 },
        fileFilter,
    });

    return maxCount === 1 ? upload.single(fileFieldName) : upload.array(fileFieldName, maxCount);
};

/* For Multiple image in one form and array */
const multiUploadFiles = (fields = [], fileType = 'image', folder = 'uploads', sizeMB = 100) => {
    const allowedTypesMap = {
        image: /jpeg|jpg|png|gif/,
        video: /mp4|mkv|avi|mov/,
        pdf: /pdf/,
        document: /doc|docx|xls|xlsx|ppt|pptx/,
        excel: /xls|xlsx/,
    };

    const allowedTypes = allowedTypesMap[fileType];
    if (!allowedTypes) throw new Error('Unsupported file type');

    const fileFilter = (req, file, cb) => {
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        extname || mimetype ? cb(null, true) : cb(new Error(`Only ${fileType} files are allowed`), false);
    };

    let storage;

    if (process.env.AWS_SDK_API_KEY && process.env.AWS_SDK_API_SECRET_KEY) {
        storage = multerS3({
            s3: new S3({
                region: 'ap-northeast-1',
                credentials: {
                    accessKeyId: process.env.AWS_SDK_API_KEY,
                    secretAccessKey: process.env.AWS_SDK_API_SECRET_KEY,
                },
            }),
            bucket: process.env.AWS_S3_BUCKET_NAME || 'aws-bucket-name',
            key: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
        });
    } else {
        storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = path.join(__dirname, `../../public/storage/${folder}`);
                ensureDirectoryExistence(uploadPath);
                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                cb(null, `${Date.now()}_${file.originalname}`);
            },
        });
    }

    return multer({
        storage,
        limits: { fileSize: sizeMB * 1024 * 1024 },
        fileFilter,
    }).fields(fields);
};

module.exports = { uploadFile, multiUploadFiles };