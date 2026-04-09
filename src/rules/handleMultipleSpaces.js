const handleMultipleSpaces = (value) => {
    const cleanedValue = value.replace(/\s+/g, ' ').trim();
    if (value !== cleanedValue) {
        return Promise.reject("Multiple spaces between words are not allowed.");
        // return Promise.reject(req.t(req.trans.validation.custom_message.multiple_space_not_allow, { attribute: req.trans.cruds.CATEGORY.fields.category }));
    }

    return Promise.resolve();
  };
  
  module.exports = handleMultipleSpaces;
  