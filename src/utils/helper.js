const constants = require('../config/constant');
const fs = require('fs');
const path = require('path');
// const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance(); /* npm install google-libphonenumber */

/**
 * Utility to check if a string is a valid JSON.
 * 
 * @param {string} str - The string to check.
 * @returns {boolean} - Returns true if the string is valid JSON, false otherwise.
 */
const isValidJson = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * Utility to capitalize the first letter of each word in a string.
 * 
 * @param {string} str - The input string.
 * @returns {string} - The string with the first letter of each word capitalized.
 */
const capitalizeWords = (str) => {
    return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

/**
 * Utility to capitalize the first word of the statement
 * 
 * @param {string} str - The input string.
 * @returns {string} - The string with the first letter of the first word capitalized.
 */
const firstWordCapitalize = (str) => {
    const firstWord = str.split(' ')[0];
    const restOfString = str.slice(firstWord.length);
    
    return firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase() + restOfString;
}


/**
 * Utility to remove duplicates from an array.
 * 
 * @param {Array} arr - The array to remove duplicates from.
 * @returns {Array} - A new array with duplicates removed.
 */
const removeDuplicates = (arr) => {
    return [...new Set(arr)];
};

/**
 * Utility to check if an object is empty.
 * 
 * @param {Object} obj - The object to check.
 * @returns {boolean} - Returns true if the object is empty, false otherwise.
 */
const isEmptyObject = (obj) => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Utility to format numbers as currency (USD).
 * 
 * @param {number} amount - The number to format.
 * @returns {string} - The formatted currency string.
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

/**
 * Utility to deep clone an object.
 * 
 * @param {Object} obj - The object to clone.
 * @returns {Object} - A deep clone of the provided object.
 */
const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Utility to generate a random string of a given length.
 * 
 * @param {number} length - The length of the random string.
 * @returns {string} - A random string of the specified length.
 */
const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

/**
 * Utility to convert a timestamp into a human-readable time difference.
 * 
 * @param {Date|string|number} timestamp - The timestamp to convert (can be a Date object, string, or timestamp).
 * @returns {string} - The time difference in a human-readable format (e.g., "2 days ago").
 */
const timeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);
    const units = [
        { label: 'second', value: 60 },
        { label: 'minute', value: 60 },
        { label: 'hour', value: 24 },
        { label: 'day', value: 30 },
        { label: 'month', value: 12 },
        { label: 'year', value: Infinity },
    ];

    let value = diffInSeconds;
    let unit = 'second';

    for (const { label, value: limit } of units) {
        if (value < limit) break;
        value = Math.floor(value / limit);
        unit = label;
    }

    return `${value} ${unit}${value > 1 ? 's' : ''} ago`;
};

/**
 * Utility to check if an email is valid.
 * 
 * @param {string} email - The email to check.
 * @returns {boolean} - Returns true if the email is valid, false otherwise.
 */
const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
};

/**
 * Utility to get the current date in a specific format (YYYY-MM-DD).
 * 
 * @returns {string} - The current date in "YYYY-MM-DD" format.
 */
const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];  // e.g. 2025-03-21
};

/**
 * Utility to generate a random number within a given range (inclusive).
 * 
 * @param {number} min - The minimum value of the range.
 * @param {number} max - The maximum value of the range.
 * @returns {number} - A random number between min and max (inclusive).
 */
const getRandomNumberInRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Utility to debounce a function (execute it after a delay).
 * 
 * @param {Function} func - The function to debounce.
 * @param {number} delay - The delay in milliseconds before the function executes.
 * @returns {Function} - A debounced version of the provided function.
 */
const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
};

/**
 * Utility to shuffle an array randomly.
 * 
 * @param {Array} arr - The array to shuffle.
 * @returns {Array} - The shuffled array.
 */
const shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

/**
 * Prepare pagination parameters from the request query.
 * 
 * @param {Object} req - The request object.
 * @returns {Object|boolean} - Returns an object containing pagination parameters or false on error.
 */
const preparePaginationParams = async (req) => {
    try {
        const {
            page = constants.PAGINATION_DEFAULTS.PAGE || 1,
            limit = constants.PAGINATION_DEFAULTS.LIMIT || 10,
            sortField = constants.PAGINATION_DEFAULTS.SORT_FIELD || 'createdAt',
            sortOrder = constants.PAGINATION_DEFAULTS.SORT_ORDER || 'desc'
        } = req.query;
        
        const parsedPage = Math.max(1, parseInt(page, 10));
        const parsedLimit = Math.min(100, parseInt(limit, 10));

        const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };
        const skip = (parsedPage - 1) * parsedLimit;
    
        return {
            page: parsedPage,
            limit: parsedLimit,
            skip,
            sort: sortOptions,
            sortField,
            sortOrder
        };
    } catch (err) {
        console.log(`Error processing pagination: ${err.message}`);
        return false;
    }
};

/**
 * Prepare pagination, sorting, and search parameters for DataTables using Mongoose.
 * 
 * @param {Object} req - The request object containing query params from DataTables.
 * @param {Array} searchableFields - Fields to search across.
 * @returns {Object} - An object with parsed pagination, sorting, and search filter.
 */
const prepareMongooseDataTablesParams = (req, searchableFields, schema, customFieldTypes = {}) => {
    const { start, length, search, order, columns } = req.query;

    const pageSize = parseInt(length) || 10;
    const pageStart = parseInt(start) || 0;

    const sortColumnIndex = order && order[0] && order[0].column ? order[0].column : 0;
    const sortDirection = order && order[0] && order[0].dir ? order[0].dir : 'asc';
    const sortColumn = columns && columns[sortColumnIndex] && columns[sortColumnIndex].data
        ? columns[sortColumnIndex].data
        : null;

    const sortOrder = sortDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let searchFilter = {};

    if (search && search.value) {
        const searchValue = search.value.trim();
        searchFilter = { $or: [] };

        searchableFields.forEach(field => {
            if (!schema.path(field)) return;
            
            // const fieldType = schema.path(field).instance;
            let fieldType;
            if (customFieldTypes[field]) {
                fieldType = customFieldTypes[field];
            } else {
                const path = schema.path(field);
                if (!path) return;
                fieldType = path.instance;
            }

            if (fieldType === 'Map') {
                const SUPPORTED_LANGUAGES = ['en', 'ar'];
                const languageConditions = SUPPORTED_LANGUAGES.map(lang => ({
                    [`${field}.${lang}`]: { $regex: new RegExp(searchValue, 'i') }
                }));
                searchFilter.$or.push(...languageConditions);
            } else if (fieldType === 'String') {
                searchFilter.$or.push({
                    [field]: { $regex: new RegExp(searchValue, 'i') },
                });
            } else if (fieldType === 'Date' && !isNaN(Date.parse(searchValue))) {
                const searchDate = new Date(searchValue);
                const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
                const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

                searchFilter.$or.push({
                    [field]: { $gte: startOfDay, $lte: endOfDay },
                });
            } else if (fieldType === 'Number' && !isNaN(searchValue)) {
                searchFilter.$or.push({
                    [field]: parseFloat(searchValue),
                });
            }
        });
    }

    return {
        pageSize,
        pageStart,
        searchFilter,
        sortColumn,
        sortOrder,
    };
};


/**
 * Helper function to build search filter dynamically based on fields and search query.
 * 
 * @param {Object} queryParams - The query parameters from the request (req.query).
 * @param {Array} fields - List of fields to be searched.
 * @param {Object} schema - The Mongoose schema for the model.
 * @returns {Object} - The filter object for querying the database.
 */
const buildSearchFilterMongoose = (queryParams, fields, schema) => {
    const filter = { $or: [] };

    fields.forEach(field => {
        if (!field) return;

        if (!queryParams[field]) return;

        const searchValue = queryParams[field];
        if (!searchValue) return;

        const fieldType = schema.path(field)?.instance;
        if (!fieldType) return;

        if (fieldType === 'Map') {
            const SUPPORTED_LANGUAGES = ['en', 'ar'];
            const languageConditions = SUPPORTED_LANGUAGES.map(lang => ({
                [`${field}.${lang}`]: { $regex: new RegExp(searchValue, 'i') }
            }));
            filter.$or.push(...languageConditions);
        } else if (fieldType === 'String') {
            filter.$or.push({
                [field]: { $regex: new RegExp(searchValue, 'i') },
            });
        } else if (fieldType === 'Date' && !isNaN(Date.parse(searchValue))) {
            const searchDate = new Date(searchValue);
            const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
            const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

            filter.$or.push({
                [field]: { $gte: startOfDay, $lte: endOfDay },
            });
        } else if (fieldType === 'Number' && !isNaN(searchValue)) {
            filter.$or.push({
                [field]: parseFloat(searchValue),
            });
        }
    });

    return filter.$or.length ? filter : {};
}

/**
 * Formats a Date object into a string according to specified formatting tokens.
 * Supports a wide variety of date/time formats including quarters, week numbers,
 * 12/24-hour time, ordinal days, and more.
 * 
 * @param {Date} date - The Date object to format
 * @param {string} format - The format string containing special tokens:
 * 
 * Year:
 *   YYYY - 4-digit year (2025)
 *   YY   - 2-digit year (25)
 * 
 * Month:
 *   MMMM - Full month name (April)
 *   MMM  - Short month name (Apr)
 *   MM   - 2-digit month (04)
 *   M    - 1/2-digit month (4)
 * 
 * Day:
 *   dddd - Full day name (Friday)
 *   ddd  - Short day name (Fri)
 *   DD   - 2-digit day (05)
 *   D    - 1/2-digit day (5)
 *   Do   - Day with ordinal (5th)
 * 
 * Time:
 *   HH   - 24-hour, 2-digit (14)
 *   H    - 24-hour, 1/2-digit (14)
 *   hh   - 12-hour, 2-digit (02)
 *   h    - 12-hour, 1/2-digit (2)
 *   mm   - 2-digit minutes (05)
 *   m    - 1/2-digit minutes (5)
 *   ss   - 2-digit seconds (09)
 *   s    - 1/2-digit seconds (9)
 *   A    - AM/PM uppercase (PM)
 *   a    - am/pm lowercase (pm)
 * 
 * Special:
 *   Q    - Quarter number (1-4)
 *   Qo   - Quarter with ordinal (1st)
 *   W    - ISO week number (1-53)
 *   [T]  - Literal 'T' character
 *   [text] - Any literal text in brackets
 * 
 * @returns {string} Formatted date string
 * 
 * @example
 * formatDate(new Date(), 'YYYY-MM-DD') // '2025-04-25'
 * formatDate(new Date(), 'dddd, MMMM Do YYYY') // 'Friday, April 25th 2025'
 * formatDate(new Date(), 'h:mm A') // '2:30 PM'
 * formatDate(new Date(), 'Qo [Quarter] YYYY') // '2nd Quarter 2025'
 * formatDate(new Date(), 'YYYY [Week] W') // '2025 Week 17'
 */
const formatDate = (date, format) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-11
    const day = date.getDate();
    const dayOfWeek = date.getDay(); // 0 (Sun) - 6 (Sat)
    const hours24 = String(date.getHours()).padStart(2, '0');
    const hours12 = String((date.getHours() % 12) || 12).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';

    // Month and day names
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthNamesShort = monthNames.map(m => m.substring(0, 3));
    const dayNames = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ];
    const dayNamesShort = dayNames.map(d => d.substring(0, 3));

    // Helper functions
    const getOrdinal = (n) => {
        if (n >= 11 && n <= 13) return 'th';
        switch (n % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    };

    // Calculate week number (ISO 8601)
    const getWeekNumber = (d) => {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

    // Calculate quarter
    const getQuarter = () => Math.floor(month / 3) + 1;
    const getQuarterWithOrdinal = () => {
        const q = getQuarter();
        return q + (q === 1 ? 'st' : q === 2 ? 'nd' : q === 3 ? 'rd' : 'th');
    };

    const replacements = {
        'YYYY': year,
        'YY': String(year).slice(-2),
        'MMMM': monthNames[month],
        'MMM': monthNamesShort[month],
        'MM': String(month + 1).padStart(2, '0'),
        'M': String(month + 1),
        'dddd': dayNames[dayOfWeek],
        'ddd': dayNamesShort[dayOfWeek],
        'DD': String(day).padStart(2, '0'),
        'D': String(day),
        'Do': day + getOrdinal(day),
        'HH': hours24,
        'H': String(date.getHours()),
        'hh': hours12,
        'h': String((date.getHours() % 12) || 12),
        'mm': minutes,
        'm': String(date.getMinutes()),
        'ss': seconds,
        's': String(date.getSeconds()),
        'A': ampm,
        'a': ampm.toLowerCase(),
        'W': getWeekNumber(date),
        'Q': getQuarter(),
        'Qo': getQuarterWithOrdinal(),
        '[T]': 'T',
        '[Week]': 'Week',
        '[Quarter]': 'Quarter'
    };

    const tokens = Object.keys(replacements).sort((a, b) => b.length - a.length);

    let formattedDate = format;

    for (const token of tokens) {
        if (token.startsWith('[') && token.endsWith(']')) {
            formattedDate = formattedDate.replace(token, replacements[token]);
            continue;
        }
        
        const regex = new RegExp(`(^|\\W)${token}(\\W|$)`, 'g');
        formattedDate = formattedDate.replace(regex, (match, p1, p2) => {
            return p1 + replacements[token] + p2;
        });
    }

    return formattedDate;
};


/**
 * Helper function to filter by date range
 */
const filterByDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return {
        createdAt: {
            $gte: start.setHours(0, 0, 0, 0),
            $lte: end.setHours(23, 59, 59, 999)
        }
    };
};

/**
 * Helper function to filter by duration (e.g., last month, today, etc.)
 */
const filterByDuration = (duration) => {
    let currentDate = new Date(); 
    let startDate, endDate;
    switch (duration) {
        case 'yearly':
            startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());
            endDate = currentDate;
            break;
        case 'halfyearly':
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, currentDate.getDate());
            endDate = currentDate;
            break;
        case 'quarterly':
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, currentDate.getDate());
            endDate = currentDate;
            break;
        case 'last_month':
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
            break;
        case 'current_month':
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            break;
        case 'today':
            startDate = currentDate;
            endDate = currentDate;
            break;
        case 'all':
            return {};
        default:
            return {};
    }

    return {
        createdAt: {
            $gte: startDate.setHours(0, 0, 0, 0),
            $lte: endDate.setHours(23, 59, 59, 999)
        }
    };
};

/**
 * Utility to convert an object to a query string.
 * 
 * @param {Object} obj - The object to convert into a query string.
 * @returns {string} - A query string (e.g., "?key1=value1&key2=value2").
 */
const objectToQueryString = (obj) => {
    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(obj)) {
        queryParams.append(key, value);
    }
    return `?${queryParams.toString()}`;
};

/**
 * Utility to parse a query string into an object.
 * 
 * @param {string} queryString - The query string (e.g., "?key1=value1&key2=value2").
 * @returns {Object} - An object with key-value pairs from the query string.
 */
const queryStringToObject = (queryString) => {
    const params = new URLSearchParams(queryString);
    const obj = {};
    params.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
};

/**
 * Utility to check if a number is an integer.
 * 
 * @param {number} num - The number to check.
 * @returns {boolean} - Returns true if the number is an integer, false otherwise.
 */
const isInteger = (num) => {
    return Number.isInteger(num);
};

/**
 * Utility to format a date to a readable string (e.g., "March 21, 2025").
 * 
 * @param {Date} date - The date to format.
 * @returns {string} - A formatted date string.
 */
const formatDateReadable = (date) => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Utility to pad a string to a specific length with a character.
 * 
 * @param {string} str - The string to pad.
 * @param {number} length - The desired length of the final string.
 * @param {string} padChar - The character to use for padding.
 * @returns {string} - The padded string.
 */
const padString = (str, length, padChar = ' ') => {
    return str.padStart(length, padChar);
};

/**
 * Utility to convert an array of objects into a map (object) based on a key.
 * 
 * @param {Array} arr - The array of objects.
 * @param {string} key - The key to map objects by.
 * @returns {Object} - The resulting map with keys and corresponding object values.
 */
const arrayToMap = (arr, key) => {
    return arr.reduce((map, item) => {
        map[item[key]] = item;
        return map;
    }, {});
};

/**
 * Utility to get the first element of an array or a default value if empty.
 * 
 * @param {Array} arr - The array to get the first element from.
 * @param {*} defaultValue - The default value to return if the array is empty.
 * @returns {*} - The first element of the array or the default value.
 */
const firstOrDefault = (arr, defaultValue = null) => {
    return arr.length > 0 ? arr[0] : defaultValue;
};

/**
 * Utility to deep merge two objects (merges properties of the second object into the first one).
 * 
 * @param {Object} obj1 - The first object.
 * @param {Object} obj2 - The second object.
 * @returns {Object} - The merged object.
 */
const deepMerge = (obj1, obj2) => {
    return Object.keys(obj2).reduce((merged, key) => {
        if (obj2[key] && typeof obj2[key] === 'object' && obj1[key]) {
            merged[key] = deepMerge(obj1[key], obj2[key]);
        } else {
            merged[key] = obj2[key];
        }
        return merged;
    }, { ...obj1 });
};

/**
 * Utility to get the last element of an array or a default value if empty.
 * 
 * @param {Array} arr - The array to get the last element from.
 * @param {*} defaultValue - The default value to return if the array is empty.
 * @returns {*} - The last element of the array or the default value.
 */
const lastOrDefault = (arr, defaultValue = null) => {
    return arr.length > 0 ? arr[arr.length - 1] : defaultValue;
};

/**
 * Utility to get the difference between two arrays (elements in the first array but not in the second).
 * 
 * @param {Array} arr1 - The first array.
 * @param {Array} arr2 - The second array.
 * @returns {Array} - An array of elements present in arr1 but not in arr2.
 */
const arrayDifference = (arr1, arr2) => {
    return arr1.filter(item => !arr2.includes(item));
};

/**
 * Utility to wait for a specific time (in milliseconds).
 * 
 * @param {number} ms - The time to wait in milliseconds.
 * @returns {Promise} - A promise that resolves after the specified time.
 */
const wait = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Utility to get the current timestamp (milliseconds since Unix epoch).
 * 
 * @returns {number} - The current timestamp.
 */
const getCurrentTimestamp = () => {
    return Date.now();
};


/**
 * Utility to format a phone number based on the country.
 * 
 * @param {string} phoneNumber - The phone number to format.
 * @param {string} countryCode - The country code (e.g., 'US', 'IN', etc.).
 * @returns {string|null} - The formatted phone number or null if invalid.
 */
const formatPhoneNumber = (phoneNumber, countryCode) => {
    try {
        const number = phoneUtil.parseAndKeepRawInput(phoneNumber, countryCode);
        if (phoneUtil.isValidNumber(number)) {
            return phoneUtil.format(number, require('google-libphonenumber').PhoneNumberFormat.INTERNATIONAL);
        } else {
            return {
                status: false,
                errorType: 'invalidNumber',
                message: 'The phone number is invalid for the specified country.'
            };
        }
    } catch (e) {
        return {
            status: false,
            errorType: 'parseError',
            message: 'An error occurred while parsing the phone number.'
        };
    }
};

/* 
* deleteFileIfExists
*/
const deleteFileIfExists = async (file) => {
    if (!file) {
        logInfo('No file provided to delete.');
        return false;
    }

    try {
        if (process.env.AWS_SDK_API_KEY && process.env.AWS_SDK_API_SECRET_KEY) {
            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME || 'leo-dev-excel-bucket',
                Key: file.key,
            };

            const command = new DeleteObjectCommand(params);
            await s3Client.send(command);
            logInfo(`File deleted from S3: ${file.key}`);
            return true;
        } else {
            const filePath = path.resolve(__dirname, '..', file.path);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                logInfo(`Local file deleted: ${filePath}`);
                return true;
            } else {
                logWarning(`Local file not found: ${filePath}`);
                return false;
            }
        }
    } catch (error) {
        logError(`Error deleting file: ${error.message}`);
        throw error;
        return false;
    }
};

/*  */
const deleteFileIfExistsUsingName = async (fileOrPath) => {
    if (!fileOrPath) {
        logInfo('No file provided to delete.');
        return false;
    }

    try {
        if (process.env.AWS_SDK_API_KEY && process.env.AWS_SDK_API_SECRET_KEY) {
            const key = typeof fileOrPath === 'string' ? fileOrPath : fileOrPath.key;
            const params = {
                Bucket: process.env.AWS_S3_BUCKET_NAME || 'leo-dev-excel-bucket',
                Key: key,
            };

            const command = new DeleteObjectCommand(params);
            await s3Client.send(command);
            logInfo(`File deleted from S3: ${key}`);
            return true;
        } else {
            let resolvedPath;
            if (typeof fileOrPath === 'string') {
                resolvedPath = path.resolve(__dirname, '..', '..', fileOrPath);
            } else {
                resolvedPath = path.resolve(__dirname, '..', '..', fileOrPath.path);
            }

            if (fs.existsSync(resolvedPath)) {
                fs.unlinkSync(resolvedPath);
                logInfo(`Local file deleted: ${resolvedPath}`);
                return true;
            } else {
                logWarning(`Local file not found: ${resolvedPath}`);
                return false;
            }
        }
    } catch (error) {
        logError(`Error deleting file: ${error.message}`);
        throw error;
    }
};


/**
 * Check if a file exists on the filesystem.
 * @param {string} relativePath - File path relative to the project root or public directory.
 * @returns {Promise<boolean>} - Resolves to true if file exists, otherwise false.
 */
const checkFileExists = async (relativePath) => {
    try {
        const filePath = path.resolve(__dirname, '..', '..', relativePath);
        if (fs.existsSync(filePath)) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
};

/* 
** Here export all functions
*/
module.exports = {
    isValidJson,
    capitalizeWords,
    firstWordCapitalize,
    removeDuplicates,
    isEmptyObject,
    formatCurrency,
    deepClone,
    generateRandomString,
    timeAgo,
    isValidEmail,
    getCurrentDate,
    getRandomNumberInRange,
    debounce,
    shuffleArray,
    preparePaginationParams,
    prepareMongooseDataTablesParams,
    buildSearchFilterMongoose,
    formatDate,
    filterByDateRange,
    filterByDuration,
    objectToQueryString,
    queryStringToObject,
    isInteger,
    formatDateReadable,
    padString,
    arrayToMap,
    firstOrDefault,
    deepMerge,
    lastOrDefault,
    arrayDifference,
    wait,
    getCurrentTimestamp,
    formatPhoneNumber,
    deleteFileIfExists,
    deleteFileIfExistsUsingName,
    checkFileExists
};