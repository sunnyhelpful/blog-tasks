const { S3Client } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: 'ap-northeast-1',
    credentials: {
        accessKeyId: process.env.AWS_SDK_API_KEY,
        secretAccessKey: process.env.AWS_SDK_API_SECRET_KEY,
    },
});

module.exports = { s3Client };