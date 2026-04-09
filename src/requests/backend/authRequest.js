const Joi = require('joi');

const loginRequest = async (req) => {
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Invalid email format',
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.empty': 'Password is required',
        }),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const extractedErrors = {};
        error.details.forEach(err => {
            extractedErrors[err.context.key] = err.message.replace(/\"/g, '');
        });
        return extractedErrors;
    }

    return null;
};

const registerRequest = async (req) => {
    const schema = Joi.object({
        first_name: Joi.string().required().messages({
            'string.empty': 'First Name is required',
        }),
        middle_name: Joi.string().optional().allow(null).messages({
            'string.empty': 'Middle Name can be empty',
        }),
        last_name: Joi.string().required().messages({
            'string.empty': 'Last Name is required',
        }),
        username: Joi.string().required().lowercase().messages({
            'string.empty': 'Username is required',
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Please enter a valid email address',
        }),
        phone_number: Joi.string().optional().allow(null).messages({
            'string.empty': 'Phone number can be empty',
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.empty': 'Password is required',
        }),
        password_confirmation: Joi.string().valid(Joi.ref('password')).required().messages({
            'any.only': 'Password confirmation does not match password',
            'string.empty': 'Password confirmation is required',
        }),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const extractedErrors = {};
        error.details.forEach(err => {
            extractedErrors[err.context.key] = err.message.replace(/\"/g, '');
        });
        return extractedErrors;
    }

    return null;
};

module.exports = { registerRequest, loginRequest };
