const fs = require('fs');
const path = require('path');
const { s3Client } = require('../config/aws');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const XLSX = require('xlsx');

const readExcelFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded. Please upload a valid file.' });
        }

        let fileContent;
        if (process.env.AWS_SDK_API_KEY && process.env.AWS_SDK_API_SECRET_KEY) {
            const fileName = req.file.key;
            fileContent = await fetchFileFromS3(fileName);
        } else {
            const filePath = path.resolve(__dirname, '..', req.file.path);
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ message: 'Uploaded file not found.' });
            }
            fileContent = fs.readFileSync(filePath);
        }

        const workbook = XLSX.read(fileContent, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const excelData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        req.excelData = excelData;

        next();
    } catch (error) {
        console.error('Error reading Excel file:', error.message);
        return res.status(500).json({ message: 'Error reading Excel file.' });
    }
};

const fetchFileFromS3 = async (fileName) => {
    try {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME || 'your-s3-bucket-name',
            Key: fileName,
        };

        const command = new GetObjectCommand(params);
        const data = await s3Client.send(command);
        return await data.Body.transformToByteArray();
    } catch (error) {
        console.error('Error fetching file from S3:', error.message);
        throw error;
    }
};


module.exports = readExcelFile;