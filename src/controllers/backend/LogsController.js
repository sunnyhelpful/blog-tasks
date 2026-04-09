// LogsController.js
const fs = require('fs').promises;
const path = require('path');
const logFilePath = path.join(__dirname, '../../../public/', 'logs/app.log');

/* 
** Fetch all logs from the log file
** GET /admin/logs
*/
async function index(req, res) {
    try {
        await fs.access(logFilePath);
        const logs = await fs.readFile(logFilePath, 'utf8');
        const logData = logs.split('\n').filter(line => line.trim() !== '');
        return res.status(200).json({
            success: true, data: logData
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(404).json({
                success: false, message: 'Log file not found'
            });
        }
        logError('Error reading logs', error.message);
        return res.status(500).json({
            success: false, message: 'Error reading logs', error: error.message
        });
    }
}

/* 
** Clear the log file
** DELETE /admin/logs/clear
*/
async function clear(req, res) {
    try {
        await fs.access(logFilePath);
        await fs.truncate(logFilePath, 0);
        return res.status(200).json({
            success: true, message: 'Log file contents cleared successfully'
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(404).json({
                success: false, message: 'Log file not found'
            });
        }
        logError('Error clearing logs', error.message);
        return res.status(500).json({
            success: false, message: 'Error clearing logs', error: error.message
        });
    }
}

module.exports = {
    index,
    clear
};
