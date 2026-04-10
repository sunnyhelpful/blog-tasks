const handleMultipleSpaces = (value) => {
    const cleanedValue = value.replace(/\s+/g, ' ').trim();
    if (value !== cleanedValue) {
        return Promise.reject("Multiple spaces between words are not allowed.");
    }

    return Promise.resolve();
  };
  
  module.exports = handleMultipleSpaces;