const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../public/logs');
const logFilePath = path.join(logDir, 'app.log');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

if (!fs.existsSync(logFilePath)) {
    fs.closeSync(fs.openSync(logFilePath, 'w'));
}

const loggerService = {
    info: (message, details) => {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} INFO: ${formatMessage(message)}` +
            (details ? ` - ${formatMessage(details)}` : '') + '\n';
        console.log(logMessage);
        fs.appendFileSync(logFilePath, logMessage);
    },
    error: (message, details) => {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} ERROR: ${formatMessage(message)}` +
            (details ? ` - ${formatMessage(details)}` : '') + '\n';
        console.error(logMessage);
        fs.appendFileSync(logFilePath, logMessage);
    },
    warning: (message, details) => {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} WARNING: ${formatMessage(message)}` +
            (details ? ` - ${formatMessage(details)}` : '') + '\n';
        console.warn(logMessage);
        fs.appendFileSync(logFilePath, logMessage);
    },
    debug: (message, details) => {
        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} DEBUG: ${formatMessage(message)}` +
            (details ? ` - ${formatMessage(details)}` : '') + '\n';
        console.debug(logMessage);
        fs.appendFileSync(logFilePath, logMessage);
    }
};

function formatMessage(message) {
    if (typeof message === 'object') {
        try {
            return JSON.stringify(message, getCircularReplacer(), 2);
        } catch (error) {
            return `[Error stringifying object: ${error.message}]`;
        }
    }
    return message;
}

function getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
                return '[Circular Reference]';
            }
            seen.add(value);
        }
        return value;
    };
}

module.exports = loggerService;