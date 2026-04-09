const { app } = require('./src/app');
const cluster = require('cluster');
const os = require('os');

const PORT = process.env.APP_PORT || 3011;
const isProduction = process.env.APP_MODES === 'production';

if (isProduction && cluster.isMaster) {
    const numCPUs = os.cpus().length;
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Forking a new worker...`);
        cluster.fork();
    });
} else {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (PID: ${process.pid})`);
    });
}
