const cron = require('node-cron');
const suspendUsers = require('./suspendUsers');

const runCrons = async (userTimezone = "Asia/Kolkata") => {
    try {
        // logInfo('Setting up cron jobs...');

        /* Schedule the cron job based on the dynamic timezone */
        cron.schedule('0 0 * * *', suspendUsers, {
            scheduled: true,
            timezone: userTimezone,
            onComplete: () => logInfo('Cron job completed'),
        });

        // logInfo('Cron job scheduled successfully');
    } catch (error) {
        logError('Error setting up cron jobs:', error);
    }
};

module.exports = runCrons;
