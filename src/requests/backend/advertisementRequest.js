const Joi = require('joi');

const addAdvertisementRequest = async (req) => {
    const schema = Joi.object({
        
    }).unknown(true);

    const { error } = schema.validate(req.body, { abortEarly: false });
    const errors = {};
    if (error) {
        error.details.forEach((err) => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }
    return Object.keys(errors).length > 0 ? errors : null;
};

const editAdvertisementRequest = async (req) => {
    const schema = Joi.object({
        
        }).unknown(true);
  
    const { error } = schema.validate(req.body, { abortEarly: false });
  
    const errors = {};
    if (error) {
        error.details.forEach((err) => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }

    return Object.keys(errors).length > 0 ? errors : null;
};  

module.exports = { addAdvertisementRequest, editAdvertisementRequest };
