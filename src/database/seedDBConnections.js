const mongoose = require('mongoose');

const waitForConnection = async () => {
    let connected = false;
    const retries = 5;
    let attempt = 0;

    while (!connected && attempt < retries) {
        try {
            const state = mongoose.connection.readyState;
            if (state === 1) {
                connected = true;
            } else {
                console.log(`Waiting for MongoDB connection... Attempt ${attempt + 1}/${retries}`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                attempt++;
            }
        } catch (error) {
            console.error('Error checking connection state:', error);
            break;
        }
    }

    if (!connected) {
        console.error('Unable to connect to MongoDB after multiple attempts.');
        process.exit(1);
    }
};

module.exports = {
    waitForConnection,
};
