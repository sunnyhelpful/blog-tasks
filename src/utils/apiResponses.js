const {
    firstWordCapitalize
} = require('../utils/helper');

/**
 * Standard Response Helper Function
 * 
 * @param {boolean} status - The status of the response (true/false).
 * @param {string} message - The response message.
 * @param {any} data - Data to be included in the response.
 * @param {any} roles - Optional roles to include in the response.
 * @param {any} permissions - Optional permissions to include in the response.
 * @param {string} redirectUrl - Optional redirect URL.
 * @returns {Object} The formatted response object.
 */
/* function getStandardResponse(status, message, data, roles = null, permissions = null, redirectUrl = null) {
    const response = {
        status: status,
        message: firstWordCapitalize(message),
        ...(status === true ? { data } : { error: data })
    };

    if (roles) response.roles = roles;
    if (permissions) response.permissions = permissions;
    if (redirectUrl) response.redirectUrl = redirectUrl;

    return response;
} */
function getStandardResponse(status, message, data, roles = null, permissions = null, redirectUrl = null) {
    const response = {
        status: status,
        message: firstWordCapitalize(message),
    };

    if (status === true) {
        if (data && typeof data === 'object') {
            const { success_type, ...rest } = data;
            if (success_type !== undefined) {
                response.success_type = success_type;
            }
            response.data = Object.keys(rest).length > 0 ? rest : data;
        } else {
            response.data = data;
        }
    } else {
        if (data && typeof data === 'object') {
            const { error_type, details, ...rest } = data;
            
            if (error_type !== undefined) {
                response.error_type = error_type;
            }
            
            if (details && typeof details === 'object') {
                response.error = details;
            } else if (Object.keys(rest).length > 0) {
                response.error = rest;
            } else {
                response.error = {};
            }
        } else {
            response.error = data !== null ? { message: data } : {};
        }
    }

    if (roles) response.roles = roles;
    if (permissions) response.permissions = permissions;
    if (redirectUrl) response.redirectUrl = redirectUrl;

    return response;
}


/* Success Response */
const successResponse = (message, data, roles = null, permissions = null, redirectUrl = null) => {
    return getStandardResponse(true, message, data, roles, permissions, redirectUrl);
};

/* Error Response */
const errorResponse = (message, data = null, roles = null, permissions = null) => {
    return getStandardResponse(false, message, data, roles, permissions);
};

/* Unauthorized Response (401) */
const unauthorizedResponse = (message = 'Unauthorized access', roles = null, permissions = null) => {
    return getStandardResponse(false, message, null, roles, permissions);
};

/* Forbidden Response (403) */
const forbiddenResponse = (message = 'Forbidden access', roles = null, permissions = null) => {
    return getStandardResponse(false, message, null, roles, permissions);
};

/* Not Found Response (404) */
const notFoundResponse = (message = 'Resource not found', roles = null, permissions = null) => {
    return getStandardResponse(false, message, null, roles, permissions);
};

/* Bad Request Response (400) */
const badRequestResponse = (message = 'Bad request', roles = null, permissions = null) => {
    return getStandardResponse(false, message, null, roles, permissions);
};

/* Conflict Response (409) */
const conflictResponse = (message = 'Conflict occurred', roles = null, permissions = null) => {
    return getStandardResponse(false, message, null, roles, permissions);
};

/* Internal Server Error Response (500) */
const internalServerErrorResponse = (message = 'Internal server error', roles = null, permissions = null) => {
    return getStandardResponse(false, message, null, roles, permissions);
};

module.exports = {
    successResponse,
    errorResponse,
    unauthorizedResponse,
    forbiddenResponse,
    notFoundResponse,
    badRequestResponse,
    conflictResponse,
    internalServerErrorResponse
};