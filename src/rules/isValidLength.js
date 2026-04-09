const isValidLength = (value) => {
    if (value.length < 1 || value.length > 255) {
        return Promise.reject("Title must be between 1 and 255 characters.");
    }
    return Promise.resolve();
};

module.exports = isValidLength;