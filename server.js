require('dotenv').config();
const { app, closeMongoPluginConnection } = require('./src/app');

const PORT = process.env.APP_PORT || 3011;

/** Start server */
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (PID: ${process.pid})`);
});

/** Graceful shutdown */
const gracefulExit = async () => {
    console.log(`Server shutting down... (PID: ${process.pid})`);

    try {
        server.close(async () => {
            console.log('No longer accepting connections');

            await closeMongoPluginConnection();

            console.log('MongoDB connection closed');
            process.exit(0);
        });

    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }

    setTimeout(() => process.exit(1), 10000);
};

/** Handle shutdown signals */
process.on('SIGTERM', gracefulExit);
process.on('SIGINT', gracefulExit);

/** Handle unexpected errors */
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulExit();
});