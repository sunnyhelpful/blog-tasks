const mongoose = require('mongoose');
const config = require('./config/database');

async function connect() {
    try {
        await mongoose.connect(config.url, {
            maxPoolSize: 10,
            socketTimeoutMS: 30000,
            connectTimeoutMS: 30000,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        process.exit(1);
    }
}

module.exports = connect;