const User = require('../models/user');

const BATCH_SIZE = 1000;

const suspendUsersAccount = async () => {
    try {
        logInfo('Starting batch suspension job');

        const now = new Date();
        let lastId = null;
        let processedCount = 0;

        while (true) {
            const query = {
                account_type: 'system_user',
                'work_schedule.last_working_date': { $lt: now },
                status: 1,
            };

            if (lastId) {
                query._id = { $gt: lastId };
            }

            const users = await User.find(query)
                .sort({ _id: -1 })
                .limit(BATCH_SIZE)
                .select('_id');

            if (users.length === 0) {
                break;
            }

            const ids = users.map(user => user._id);
            
            await User.updateMany(
                { _id: { $in: ids } },
                { $set: { status: 2 } }
            );

            processedCount += users.length;
            lastId = users[users.length - 1]._id;

            logInfo(`Processed and suspended ${users.length} user(s), total processed: ${processedCount}`);
        }

        logInfo(`Batch suspension completed. Total users suspended: ${processedCount}`);
    } catch (error) {
        logError('Error in batch suspension:', error);
    }
};

module.exports = suspendUsersAccount;
