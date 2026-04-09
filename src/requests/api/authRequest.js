const Joi = require('joi');
const User = require('../../models/user');
const Role = require('../../models/role');

const registerRequest = async (req) => {
    const schema = Joi.object({
        first_name: Joi.string()
            .trim()
            .max(90)
            .required()
            .custom((value, helper) => {
                if (/\s{2,}/.test(value)) {
                    return helper.message(req.t(req.trans.validation.custom_message.multiple_space_not_allow, {
                        attribute: req.trans.cruds.USER.fields.first_name
                    }));
                }

                if (!/^[A-Za-z\u0600-\u06FF\s]+$/.test(value)) {
                    return helper.message(req.t('validation.string_alpha_only', { attribute: req.trans.cruds.USER.fields.first_name }));
                }

                return value;
            }).messages({
                'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.first_name }),
                'string.max': req.t('validation.string_max', { attribute: req.trans.cruds.USER.fields.first_name, max: 90 }),
                'string.base': req.t('validation.string_base', { attribute: req.trans.cruds.USER.fields.first_name })
            }),

        middle_name: Joi.string()
            .trim()
            .max(90)
            .optional()
            .allow(null, '')
            .custom((value, helper) => {
                if (/\s{2,}/.test(value)) {
                    return helper.message(req.t(req.trans.validation.custom_message.multiple_space_not_allow, {
                        attribute: req.trans.cruds.USER.fields.middle_name
                    }));
                }

                if (value && !/^[A-Za-z\u0600-\u06FF\s]+$/.test(value)) {
                    return helper.message(req.t('validation.string_alpha_only', { attribute: req.trans.cruds.USER.fields.middle_name }));
                }

                return value;
            }).messages({
                'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.middle_name }),
                'string.max': req.t('validation.string_max', { attribute: req.trans.cruds.USER.fields.middle_name, max: 90 }),
                'string.base': req.t('validation.string_base', { attribute: req.trans.cruds.USER.fields.middle_name })
            }),

        last_name: Joi.string()
            .trim()
            .max(90)
            .required()
            .custom((value, helper) => {
                if (/\s{2,}/.test(value)) {
                    return helper.message(req.t(req.trans.validation.custom_message.multiple_space_not_allow, {
                        attribute: req.trans.cruds.USER.fields.last_name
                    }));
                }

                if (!/^[A-Za-z\u0600-\u06FF\s]+$/.test(value)) {
                    return helper.message(req.t('validation.string_alpha_only', { attribute: req.trans.cruds.USER.fields.last_name }));
                }

                return value;
            }).messages({
                'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.last_name }),
                'string.max': req.t('validation.string_max', { attribute: req.trans.cruds.USER.fields.last_name, max: 90 }),
                'string.base': req.t('validation.string_base', { attribute: req.trans.cruds.USER.fields.last_name })
            }),

        username: Joi.string().alphanum().required().messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.username }),
            'string.alphanum': req.t(req.trans.validation.custom_message.alphanum_only, { attribute: req.trans.cruds.USER.fields.username }),
        }),
        email: Joi.string().email().trim().required().messages({
            'string.email': req.t('validation.email_invalid', { attribute: req.trans.cruds.USER.fields.email }),
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.email }),
        }),
        country_code: Joi.string()
            .optional()
            .allow('', null)
            .default('+91'),

        phone_number: Joi.string()
            .optional()
            .allow('', null)
            .pattern(/^[+]?[0-9]{8,15}$/)
            .messages({
                'string.pattern.base': req.t('validation.invalid_phone_number', { attribute: req.trans.cruds.USER.fields.phone_number }),
            }),
        password: Joi.string().min(6).trim().optional().messages({
            'string.min': req.t('validation.string_min', { attribute: req.trans.cruds.USER.fields.password, min: 6 }),
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.password }),
        }),
        password_confirmation: Joi.string().valid(Joi.ref('password')).trim().optional().messages({
            'any.only': req.t('validation.password_mismatch', { attribute: req.trans.cruds.USER.fields.password_confirmation }),
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.password_confirmation }),
        }),
    }).unknown(true);

    const { error } = schema.validate(req.body, { abortEarly: false });

    const errors = {};

    if (error) {
        error.details.forEach(err => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }

    /* if(req.body.role){
        const roleExists = await Role.findById(req.body.role);
        if (!roleExists) {
            errors.role = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.USER.fields.role });
        }
    } */

    const existingUserByUsername = await User.findOne({ 
        username: req.body.username,
        isDeleted: false,
    });
    if (existingUserByUsername) {
        errors.username = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.USER.fields.username });
    }

    const existingUserByEmail = await User.findOne({ 
        email: req.body.email,
        isDeleted: false,
    });    
    if (existingUserByEmail) {
        errors.email = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.USER.fields.email });
    }

    if(req.body.phone_number){
        const existingUserByPhoneNumber = await User.findOne({ 
            phone_number: req.body.phone_number,
            isDeleted: false,
        });        
        if (existingUserByPhoneNumber) {
            errors.phone_number = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.USER.fields.phone_number });
        }
    }

    return Object.keys(errors).length > 0 ? errors : null;
};

const loginRequest = async (req) => {
    const schema = Joi.object({
        email_or_phone: Joi.alternatives().try(
            Joi.string()
                .email()
                .trim()
                .messages({
                    'string.email': req.t('validation.email_invalid', { attribute: req.trans.cruds.USER.fields.email }),
                    'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.email }),
                    'string.base': req.t('validation.string_base', { attribute: req.trans.cruds.USER.fields.email })
                }),
            Joi.string()
                .pattern(/^\+?[0-9]{7,15}$/)
                .trim()
                .messages({
                    'string.pattern.base': req.t('validation.phone_invalid', { attribute: req.trans.cruds.USER.fields.phone }),
                    'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.phone }),
                    'string.base': req.t('validation.string_base', { attribute: req.trans.cruds.USER.fields.phone })
                })
        ).required(),
        password: Joi.string()
            .min(6)
            .trim()
            .required()
            .messages({
                'string.min': req.t('validation.string_min', { attribute: req.trans.cruds.USER.fields.password, min: 6 }),
                'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.password }),
                'string.base': req.t('validation.string_base', { attribute: req.trans.cruds.USER.fields.password })
            }),
    });

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const errors = {};
        error.details.forEach(err => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
        return errors;
    }

    return null;
};

const socialRequest = async (req) => {
    const schema = Joi.object({
        provider: Joi.string()
            .valid('google', 'facebook', 'apple')
            .required()
            .messages({
                'any.only': req.t('validation.invalid_value', { attribute: req.trans.cruds.USER.fields.auth_provider }),
                'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.auth_provider }),
            }),

        socialId: Joi.string()
            .trim()
            .required()
            .messages({
                'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.social_id }),
                'string.base': req.t('validation.string_base', { attribute: req.trans.cruds.USER.fields.social_id }),
            }),

        email: Joi.string()
            .email()
            .trim()
            .when('provider', {
                is: Joi.not('apple'),
                then: Joi.required(),
                otherwise: Joi.optional().allow(null, '')
            })
            .messages({
                'string.email': req.t('validation.email_invalid', { attribute: req.trans.cruds.USER.fields.email }),
                'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.email }),
            }),

        first_name: Joi.string()
            .trim()
            .max(90)
            .optional()
            .allow(null, '')
            .custom((value, helper) => {
                if (value && /\s{2,}/.test(value)) {
                    return helper.message(req.t(req.trans.validation.custom_message.multiple_space_not_allow, {
                        attribute: req.trans.cruds.USER.fields.first_name
                    }));
                }
                if (value && !/^[A-Za-z\u0600-\u06FF\s]+$/.test(value)) {
                    return helper.message(req.t('validation.string_alpha_only', {
                        attribute: req.trans.cruds.USER.fields.first_name
                    }));
                }
                return value;
            })
            .messages({
                'string.max': req.t('validation.string_max', { attribute: req.trans.cruds.USER.fields.first_name, max: 90 }),
                'string.base': req.t('validation.string_base', { attribute: req.trans.cruds.USER.fields.first_name }),
            }),

        middle_name: Joi.string()
            .trim()
            .max(90)
            .optional()
            .allow(null, '')
            .custom((value, helper) => {
                if (value && /\s{2,}/.test(value)) {
                    return helper.message(req.t(req.trans.validation.custom_message.multiple_space_not_allow, {
                        attribute: req.trans.cruds.USER.fields.middle_name
                    }));
                }
                if (value && !/^[A-Za-z\u0600-\u06FF\s]+$/.test(value)) {
                    return helper.message(req.t('validation.string_alpha_only', {
                        attribute: req.trans.cruds.USER.fields.middle_name
                    }));
                }
                return value;
            })
            .messages({
                'string.max': req.t('validation.string_max', { attribute: req.trans.cruds.USER.fields.middle_name, max: 90 }),
                'string.base': req.t('validation.string_base', { attribute: req.trans.cruds.USER.fields.middle_name }),
            }),

        last_name: Joi.string()
            .trim()
            .max(90)
            .optional()
            .allow(null, '')
            .custom((value, helper) => {
                if (value && /\s{2,}/.test(value)) {
                    return helper.message(req.t(req.trans.validation.custom_message.multiple_space_not_allow, {
                        attribute: req.trans.cruds.USER.fields.last_name
                    }));
                }
                if (value && !/^[A-Za-z\u0600-\u06FF\s]+$/.test(value)) {
                    return helper.message(req.t('validation.string_alpha_only', {
                        attribute: req.trans.cruds.USER.fields.last_name
                    }));
                }
                return value;
            })
            .messages({
                'string.max': req.t('validation.string_max', { attribute: req.trans.cruds.USER.fields.last_name, max: 90 }),
                'string.base': req.t('validation.string_base', { attribute: req.trans.cruds.USER.fields.last_name }),
            }),
    }).unknown(true);

    const errors = {};

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        error.details.forEach(err => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }

    return Object.keys(errors).length > 0 ? errors : null;
};

module.exports = { registerRequest, loginRequest, socialRequest };
