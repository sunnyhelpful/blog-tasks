const logger = require('./loggerService');

const logInfo = (message, details = null) => {
    logger.info(message, details);
};

const logError = (message, details = null) => {
    logger.error(message, details);
};

const logDebug = (message, details = null) => {
    logger.debug(message, details);
};

const logWarning = (message, details = null) => {
    logger.warning(message, details);
};

global.logInfo = logInfo;
global.logError = logError;
global.logDebug = logDebug;
global.logWarning = logWarning;
