const Joi = require('joi');
const User = require('../../models/user');
const Role = require('../../models/role');

const addUserRequest = async (req) => {
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
        phone_number: Joi.string().pattern(/^[0-9]{7,15}$/).optional().allow(null, '').messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.phone_number }),
            'string.pattern.base': req.t('validation.invalid_phone_number', { attribute: req.trans.cruds.USER.fields.phone_number })
        }),
        role: Joi.string().trim().required().messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.role }),
        }),
        password: Joi.string().min(6).trim().optional().messages({
            'string.min': req.t('validation.string_min', { attribute: req.trans.cruds.USER.fields.password, min: 6 }),
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.password }),
        }),
        password_confirmation: Joi.string().valid(Joi.ref('password')).trim().optional().messages({
            'any.only': req.t('validation.password_mismatch', { attribute: req.trans.cruds.USER.fields.password_confirmation }),
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.password_confirmation }),
        }),
        city:Joi.string().trim().required().messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.ADDRESS.fields.city }),
        }) ,
        postal_code:Joi.string().required().pattern(/^[0-9]{3,7}$/).messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.ADDRESS.fields.postal_code}),
            'string.pattern.base': req.t('validation.invalid_value', { attribute: req.trans.cruds.ADDRESS.fields.postal_code })
        }),
        country:Joi.string().trim().required().messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.ADDRESS.fields.country}),
        })  
    }).unknown(true);

    const { error } = schema.validate(req.body, { abortEarly: false });

    const errors = {};

    if (error) {
        error.details.forEach(err => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }

    const roleExists = await Role.findById(req.body.role);
    if (!roleExists) {
        errors.role = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.USER.fields.role });
    }

    const existingUserByUsername = await User.findOne({ 
        username: req.body.username,
        isDeleted: false,
        deletedAt: null,
    });
    if (existingUserByUsername) {
        errors.username = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.USER.fields.username });
    }

    const existingUserByEmail = await User.findOne({ 
        email: req.body.email,
        isDeleted: false,
        deletedAt: null,
    });    
    if (existingUserByEmail) {
        errors.email = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.USER.fields.email });
    }

    if(req.body.phone_number){
        const existingUserByPhoneNumber = await User.findOne({ 
            phone_number: req.body.phone_number,
            isDeleted: false,
            deletedAt: null,
        });        
        if (existingUserByPhoneNumber) {
            errors.phone_number = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.USER.fields.phone_number });
        }
    }

    return Object.keys(errors).length > 0 ? errors : null;
};

const editUserRequest = async (req) => {
    const { id } = req.params;
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
        phone_number: Joi.string().pattern(/^[+]?[0-9]{7,15}$/).optional().allow(null, '').messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.phone_number }),
            'string.pattern.base': req.t('validation.invalid_phone_number', { attribute: req.trans.cruds.USER.fields.phone_number })
        }),
        role: Joi.string().trim().required().messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.role }),
        }),
        password: Joi.string().optional().allow(null, '').messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.password }),
        }),
        password_confirmation: Joi.string()
            .valid(Joi.ref('password'))
            .optional()
            .when('password', {
                is: Joi.exist(),
                then: Joi.required().messages({
                    'any.only': req.t('validation.password_mismatch', { attribute: req.trans.cruds.USER.fields.password_confirmation }),
                }),
            })
            .messages({
                'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.USER.fields.password_confirmation }),
            }),
             city:Joi.string().trim().required().messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.ADDRESS.fields.city }),
        }) ,
        postal_code:Joi.string().required().pattern(/^[0-9]{3,7}$/).messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.ADDRESS.fields.postal_code}),
            'string.pattern.base': req.t('validation.invalid_value', { attribute: req.trans.cruds.ADDRESS.fields.postal_code })
        }),
        country:Joi.string().trim().required().messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.ADDRESS.fields.country}),
        }),  
    }).unknown(true);

    const { error } = schema.validate(req.body, { abortEarly: false });

    const errors = {};

    if (error) {
        error.details.forEach(err => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }

    const roleExists = await Role.findById(req.body.role);
    if (!roleExists) {
        errors.role = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.USER.fields.role });
    }

    const existingUserByUsername = await User.findOne({ 
        username: req.body.username,
        isDeleted: false,
        deletedAt: null,
    });
    if (existingUserByUsername && existingUserByUsername._id.toString() !== id) {
        errors.username = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.USER.fields.username });
    }

    const existingUserByEmail = await User.findOne({ 
        email: req.body.email,
        isDeleted: false,
        deletedAt: null,
    });
    if (existingUserByEmail && existingUserByEmail._id.toString() !== id) {
        errors.email = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.USER.fields.email });
    }

    if(req.body.phone_number){
        const existingUserByPhoneNumber = await User.findOne({ 
            phone_number: req.body.phone_number,
            isDeleted: false,
            deletedAt: null,
        });
        if (existingUserByPhoneNumber && existingUserByPhoneNumber._id.toString() !== id) {
            errors.phone_number = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.USER.fields.phone_number });
        }
    }

    return Object.keys(errors).length > 0 ? errors : null;
};

module.exports = { addUserRequest, editUserRequest };
