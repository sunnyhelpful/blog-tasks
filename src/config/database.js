require('dotenv').config();
const dns = require('node:dns/promises');
dns.setServers(['8.8.8.8', '1.1.1.1', '1.0.0.1']);
const APP_MODE = process.env.APP_MODE || 'local';

const config = {
    local: {
        url: process.env.DB_URL_FOR_LOCAL
    },
    development: {
        url: process.env.DB_URL_FOR_DEVELOPMENT
    },
    staging: {
        url: process.env.DB_URL_FOR_STAGING
    },
    testing: {
        url: process.env.DB_URL_FOR_TESTING
    },
    production: {
        url: process.env.DB_URL_FOR_PRODUCTION
    },
};

const dbConfig = config[APP_MODE] || config.local;

module.exports = {
    url: dbConfig.url
};
