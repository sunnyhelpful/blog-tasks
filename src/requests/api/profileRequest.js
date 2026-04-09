const Joi = require('joi');
const User = require('../../models/user');
const Role = require('../../models/role');
const bcrypt = require('bcryptjs'); 

const addProfileRequest = async (req) => {
    
};

const editProfileRequest = async (req) => {
    const schema = Joi.object({
        first_name: Joi.string()
            .pattern(/^[A-Za-z\u0600-\u06FF\s]+$/)
            .max(150)
            .required()
            .messages({
                'any.required': req.t('validation.string_required', { attribute: req.trans.cruds.PROFILE.fields.first_name }),
                'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.PROFILE.fields.first_name }),
                'string.max': req.t('validation.string_max', { attribute: req.trans.cruds.PROFILE.fields.first_name, max: 150 }),
                'string.pattern.base': req.t('validation.string_alpha_only', { attribute: req.trans.cruds.PROFILE.fields.first_name }),
                'string.base': req.t('validation.string_base', { attribute: req.trans.cruds.PROFILE.fields.first_name })
            }),

        middle_name: Joi.string()
            .max(150)
            .optional()
            .allow(null, '')
            .messages({
                'string.base': req.t('validation.string_base', { attribute: req.trans.cruds.PROFILE.fields.middle_name }),
                'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.PROFILE.fields.middle_name }),
                'string.max': req.t('validation.string_max', { attribute: req.trans.cruds.PROFILE.fields.middle_name, max: 150 })
            }),
        

        last_name: Joi.string()
            .max(150)
            .required()
            .messages({
                'string.base': req.t('validation.string_base', { attribute: req.trans.cruds.PROFILE.fields.last_name }),
                'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.PROFILE.fields.last_name }),
                'string.max': req.t('validation.string_max', { attribute: req.trans.cruds.PROFILE.fields.last_name, max: 150 })
            }),
        

        username: Joi.string().required().lowercase().messages({
            'any.required': req.t('validation.string_required', { attribute: req.trans.cruds.PROFILE.fields.username }),
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.PROFILE.fields.username }),
        }),

        email: Joi.string().email().optional().allow(null, '').messages({
            'string.email': req.t('validation.email_invalid', { attribute: req.trans.cruds.PROFILE.fields.email }),
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.PROFILE.fields.email }),
        }),

        phone_number: Joi.string().pattern(/^[+]?[0-9]{8,15}$/).required().messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.PROFILE.fields.phone_number }),
            'string.pattern.base': req.t('validation.invalid_phone_number', { attribute: req.trans.cruds.PROFILE.fields.phone_number })
        }),

        address_line_1:Joi.string().trim().required().messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.ADDRESS.fields.address_line_1}),
        }),

        address_line_2:Joi.string().trim().required().messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.ADDRESS.fields.address_line_2}),
        }),

        city:Joi.string().trim().required().messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.ADDRESS.fields.city }),
        }),

        state:Joi.string().trim().required().messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.ADDRESS.fields.state}),
        }),

        country:Joi.string().trim().required().messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.ADDRESS.fields.country}),
        }),

        postal_code:Joi.string().required().pattern(/^[0-9]{3,7}$/).messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.ADDRESS.fields.postal_code}),
            'string.pattern.base': req.t('validation.invalid_value', { attribute: req.trans.cruds.ADDRESS.fields.postal_code })
        }),

    }).unknown(true);

    const { error } = schema.validate(req.body, { abortEarly: false });
    const errors = {};

    if (error) {
        error.details.forEach(err => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }

    const id = req.user._id;

    const existingUserByUsername = await User.findOne({ 
        username: req.body.username,
        isDeleted: false,
    });
    if (existingUserByUsername && existingUserByUsername._id.toString() !== id.toString()) {
        errors.username = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.PROFILE.fields.username });
    }

    if (req.body.phone_number) {
        const existingUserByPhoneNumber = await User.findOne({ 
            phone_number: req.body.phone_number,
            isDeleted: false,
        });
        if (existingUserByPhoneNumber && existingUserByPhoneNumber._id.toString() !== id.toString()) {
            errors.phone_number = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.PROFILE.fields.phone_number });
        }
    }

    const existingUserByEmail = await User.findOne({ 
        email: req.body.email,
        isDeleted: false,
    });
    if (existingUserByEmail && existingUserByEmail._id.toString() !== id.toString()) {
        errors.email = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.PROFILE.fields.email });
    }

    return Object.keys(errors).length > 0 ? errors : null;
};

const editProfilePasswordRequest = async (req) => {
    const schema = Joi.object({
        current_password: Joi.string().required().messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.PROFILE.fields.current_password }),
        }),
        password: Joi.string()
            .pattern(new RegExp('^[A-Z][A-Za-z\\d@$!%*?&]{7,}$'))
            .pattern(/[a-z]/)
            .pattern(/[0-9]/)
            .pattern(/[@$!%*?&]/)
            .required()
            .messages({
                'string.empty': req.t('validation.string_required', { attribute: 'Password' }),
                'string.pattern.base': req.t('validation.string_pattern_base', { attribute: 'Password' }),
            }),
        password_confirmation: Joi.string()
            .valid(Joi.ref('password'))
            .optional()
            .when('password', {
                is: Joi.exist(),
                then: Joi.required().messages({
                    'any.only': req.t('validation.password_mismatch', { attribute: req.trans.cruds.PROFILE.fields.confirm_password }),
                }),
            })
            .messages({
                'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.PROFILE.fields.confirm_password }),
            }),
    }).unknown(true);

    const { error } = schema.validate(req.body, { abortEarly: false });
    const errors = {};

    if (error) {
        error.details.forEach(err => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }

    if (req.body.password && !req.body.current_password) {
        return { current_password: req.t('validation.string_required', { attribute: req.trans.cruds.PROFILE.fields.current_password }) };
    }

    const id = req.user._id;
    if (req.body.password && req.body.current_password) {
        const user = await User.findById(id);
        if (!user) {
            return { user: req.t(req.trans.messages.not_found, { attribute: req.trans.cruds.MODULE.PROFILE }) };
        }
    
        const isMatch = await bcrypt.compare(req.body.current_password, user.password);
        if (!isMatch) {
            return { current_password: req.t('validation.password_incorrect') };
        }
    
        const isSameAsOld = await bcrypt.compare(req.body.password, user.password);
        if (isSameAsOld) {
            return { password: req.t('validation.password_same_as_old') };
        }
    }
    return Object.keys(errors).length > 0 ? errors : null;
};


module.exports = { 
    addProfileRequest, 
    editProfileRequest,
    editProfilePasswordRequest
};
