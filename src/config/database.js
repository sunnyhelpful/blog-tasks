require('dotenv').config();
const dns = require('node:dns/promises');
dns.setServers(['8.8.8.8', '1.1.1.1', '1.0.0.1']);
const APP_MODE = process.env.APP_MODE || 'local';

/**
 * Database configuration per environment
 */
const dbConfigs = {
    local: {
        url: process.env.DB_URL_FOR_LOCAL,
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

/**
 * Mongoose connection options
 */
const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
    connectTimeoutMS: 30000,
    maxIdleTimeMS: 30000,
    waitQueueTimeoutMS: 10000,

    /* .. */
    tls: APP_MODE === 'local' ? false : true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
    family: 4
};

/**
 * Callback when MongoDB successfully connects.
 */
const mongoConnectCallback = () => {
    console.debug('MongoDB connected successfully');
};

/**
 * Callback when a MongoDB connection error occurs.
 * @param {Error} error
 */
const mongoErrorCallback = (error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
};

/**
 * Callback when MongoDB disconnects.
 */
const mongoDisconnectCallback = () => {
    console.debug('MongoDB disconnected');
};

/**
 * Gracefully closes MongoDB connection
 * @returns {Promise<void>}
 */
const closeMongoPluginConnection = () => {
    return mongoose.connection
        .close(false)
        .then(() => {
            console.debug('MongoDB connection closed');
        })
        .catch((err) => {
            console.error('Error closing MongoDB connection:', err);
            throw err;
        });
};

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
const connect = () => {
    return new Promise((resolve, reject) => {
        mongoose.connect(dbConfig.url, options);

        mongoose.connection.on('connecting', () => {
            console.debug('MongoDB connecting...');
        });

        mongoose.connection.on('connected', () => {
            console.log(`Worker ${process.pid}: MongoDB connected successfully`);
            mongoConnectCallback();
            resolve();
        });

        mongoose.connection.on('reconnected', () => {
            console.debug('MongoDB reconnected');
        });

        mongoose.connection.on('disconnecting', () => {
            console.debug('MongoDB disconnecting...');
        });

        mongoose.connection.on('disconnected', mongoDisconnectCallback);

        mongoose.connection.on('error', (err) => {
            mongoErrorCallback(err);
            reject(err);
        });
    });
};

module.exports = {
    connect,
    closeMongoPluginConnection,
};
