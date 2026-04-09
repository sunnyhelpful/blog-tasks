require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

const APP_MODE = process.env.APP_MODE || 'local';

const dbConfigs = {
    local: {
        url: process.env.DB_URL_FOR_LOCAL || 'mongodb://127.0.0.1:27017/test',
    },
    development: {
        url: process.env.DB_URL_FOR_DEVELOPMENT,
    },
    staging: {
        url: process.env.DB_URL_FOR_STAGING,
    },
    testing: {
        url: process.env.DB_URL_FOR_TESTING,
    },
    production: {
        url: process.env.DB_URL_FOR_PRODUCTION,
    },
};

const dbConfig = dbConfigs[APP_MODE] || dbConfigs.local;

const isSRV = dbConfig.url.startsWith('mongodb+srv://');

const connect = async () => {
    try {
        if (isSRV) {
            dns.setServers(['8.8.8.8', '1.1.1.1']);
        }

        await mongoose.connect(dbConfig.url, {
            serverSelectionTimeoutMS: 10000,
            ...(isSRV ? {} : { family: 4 }),
        });

        console.log(`MongoDB connected (${APP_MODE})`);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        process.exit(1);
    }
};

const closeMongoPluginConnection = async () => {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
};

module.exports = {
    connect,
    closeMongoPluginConnection,
};