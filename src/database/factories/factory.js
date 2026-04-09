const mongoose = require('mongoose');
const connect = require('../../dbConnect');
const { waitForConnection } = require('../seedDBConnections');

const { generateUser } = require('./userFactory');
const User = require('../../models/user');

const { generateNotification } = require('./notificationFactory');
const Notification = require('../../models/notification');

const seedFakeNotifications = async () => {
    try {
        console.log('Connecting to database...');
        await connect();
        await waitForConnection();
        console.log('Database connected successfully');

        const adminUser = await User.findOne({ email: 'admin@gmail.com', isDeleted: false });
        const employeeUser = await User.findOne({ email: 'employee@gmail.com', isDeleted: false });
        const userUser = await User.findOne({ email: 'user@gmail.com', isDeleted: false });

        if (!adminUser || !employeeUser || !userUser) {
            throw new Error('Admin or Employee or User not found!');
        }

        const total = 10000;
        const batchSize = 1000;

        for (let i = 0; i < total; i += batchSize) {
            const batch = Array.from({ length: batchSize }).map(() =>
                /* For Notifications */
                /* generateNotification({
                    senderId: employeeUser._id,
                    recipientId: adminUser._id,
                }) */

                /* For Users */
                generateUser({ role_id: userUser._id })

                /*  */
                
            );

            await User.insertMany(batch);
            // await Notification.insertMany(batch);

            console.log(`Inserted ${i + batchSize}/${total} fake datas`);
        }

        console.log('factories run successfully!');
    } catch (error) {
        console.error('Error running factories:', error);
    } finally {
        console.log('Closing database connection...');
        await mongoose.connection.close();
        console.log('Database connection closed');
        process.exit();
    }
};

seedFakeNotifications();
