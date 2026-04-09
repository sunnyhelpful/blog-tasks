const Joi = require('joi');
const Tier = require('../../models/tier');
const constantKey = require('../../config/constant');

const addTierRequest = async (req) => {
    const schema = Joi.object({
        title_en: Joi.string()
            .trim()
            .required()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
                'string.empty': req.t('validation.string_required', {
                    attribute: req.trans.cruds.TIER.fields.title_en,
                }),
                'string.pattern.name': req.t(
                    req.trans.validation.custom_message.multiple_space_not_allow
                ),
            }),

        title_ar: Joi.string()
            .trim()
            .required()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
                'string.empty': req.t('validation.string_required', {
                    attribute: req.trans.cruds.TIER.fields.title_ar,
                }),
                'string.pattern.name': req.t(
                    req.trans.validation.custom_message.multiple_space_not_allow
                ),
            }),

        tierNumber: Joi.string()
            .trim()
            .required()
            .messages({
                'string.empty': req.t('validation.string_required', {
                    attribute: req.trans.cruds.TIER.fields.tierNumber,
                }),
            }),

        maxPostedListings: Joi.number()
            .min(0)
            .required()
            .messages({
                'number.base': req.t('validation.number_base', {
                    attribute: req.trans.cruds.TIER.fields.maxPostedListings,
                }),
                'number.min': req.t('validation.number_min', {
                    attribute: req.trans.cruds.TIER.fields.maxPostedListings,
                    min: 0,
                }),
                'any.required': req.t('validation.number_required', {
                    attribute: req.trans.cruds.TIER.fields.maxPostedListings,
                }),
            }),

        listingDurationDays: Joi.number()
            .min(0)
            .max(365)
            .required()
            .messages({
                'number.base': req.t('validation.number_base', {
                    attribute: req.trans.cruds.TIER.fields.listingDurationDays,
                }),
                'number.min': req.t('validation.number_min', {
                    attribute: req.trans.cruds.TIER.fields.listingDurationDays,
                    min: 0,
                }),
                'number.max': req.t('validation.number_max', {
                    attribute: req.trans.cruds.TIER.fields.listingDurationDays,
                    max: 365,
                }),
                'any.required': req.t('validation.number_required', {
                    attribute: req.trans.cruds.TIER.fields.listingDurationDays,
                }),
            }),

        annualSubscription: Joi.number()
            .min(0)
            .required()
            .messages({
                'number.base': req.t('validation.number_base', {
                    attribute: req.trans.cruds.TIER.fields.annualSubscription,
                }),
                'number.min': req.t('validation.number_min', {
                    attribute: req.trans.cruds.TIER.fields.annualSubscription,
                    min: 0,
                }),
                'any.required': req.t('validation.number_required', {
                    attribute: req.trans.cruds.TIER.fields.annualSubscription,
                }),
            }),

        applicableFeePercent: Joi.number()
            .min(0)
            .max(100)
            .required()
            .messages({
                'number.base': req.t('validation.number_base', {
                    attribute: req.trans.cruds.TIER.fields.applicableFeePercent,
                }),
                'number.min': req.t('validation.number_min', {
                    attribute: req.trans.cruds.TIER.fields.applicableFeePercent,
                    min: 0,
                }),
                'number.max': req.t('validation.number_max', {
                    attribute: req.trans.cruds.TIER.fields.applicableFeePercent,
                    max: 100,
                }),
                'any.required': req.t('validation.number_required', {
                    attribute: req.trans.cruds.TIER.fields.applicableFeePercent,
                }),
            }),

        maxFee: Joi.number()
            .min(0)
            .required()
            .messages({
                'number.base': req.t('validation.number_base', {
                    attribute: req.trans.cruds.TIER.fields.maxFee,
                }),
                'number.min': req.t('validation.number_min', {
                    attribute: req.trans.cruds.TIER.fields.maxFee,
                    min: 0,
                }),
                'any.required': req.t('validation.number_required', {
                    attribute: req.trans.cruds.TIER.fields.maxFee,
                }),
            }),

    }).unknown(true);

    const { error } = schema.validate(req.body, { abortEarly: false });

    const errors = {};

    if (error) {
        error.details.forEach(err => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }

    if (req.body.tierNumber) {
        const tierNumberKeys = Object.keys(constantKey.TIER.TIER_NUMBERS);
        if (!tierNumberKeys.includes(req.body.tierNumber)) {
            errors.tierNumber = req.t('validation.invalid_value', { 
                attribute: req.trans.cruds.TIER.fields.tierNumber 
            });
        }
    }


    if(req.body.title_en){
        const existingEn = await Tier.findOne({
            isDeleted: false,
            'title.en': { $regex: new RegExp('^' + req.body.title_en + '$', 'i') },
        });
        if (existingEn) {
            errors.title_en = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.TIER.fields.title_en });
        }
    }

    if(req.body.title_ar){
        const existingAr = await Tier.findOne({
            isDeleted: false,
            'title.ar': { $regex: new RegExp('^' + req.body.title_ar + '$', 'i') },
        });
        if (existingAr) {
            errors.title_ar = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.TIER.fields.title_ar });
        }
    }

    return Object.keys(errors).length > 0 ? errors : null;
};

const editTierRequest = async (req) => {
    const { id } = req.params;
    const schema = Joi.object({
        title_en: Joi.string()
            .trim()
            .required()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
                'string.empty': req.t('validation.string_required', {
                    attribute: req.trans.cruds.TIER.fields.title_en,
                }),
                'string.pattern.name': req.t(
                    req.trans.validation.custom_message.multiple_space_not_allow
                ),
            }),

        title_ar: Joi.string()
            .trim()
            .required()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
                'string.empty': req.t('validation.string_required', {
                    attribute: req.trans.cruds.TIER.fields.title_ar,
                }),
                'string.pattern.name': req.t(
                    req.trans.validation.custom_message.multiple_space_not_allow
                ),
            }),

        tierNumber: Joi.string()
            .trim()
            .required()
            .messages({
                'string.empty': req.t('validation.string_required', {
                    attribute: req.trans.cruds.TIER.fields.tierNumber,
                }),
            }),

        maxPostedListings: Joi.number()
            .min(0)
            .required()
            .messages({
                'number.base': req.t('validation.number_base', {
                    attribute: req.trans.cruds.TIER.fields.maxPostedListings,
                }),
                'number.min': req.t('validation.number_min', {
                    attribute: req.trans.cruds.TIER.fields.maxPostedListings,
                    min: 0,
                }),
                'any.required': req.t('validation.number_required', {
                    attribute: req.trans.cruds.TIER.fields.maxPostedListings,
                }),
            }),

        listingDurationDays: Joi.number()
            .min(0)
            .max(365)
            .required()
            .messages({
                'number.base': req.t('validation.number_base', {
                    attribute: req.trans.cruds.TIER.fields.listingDurationDays,
                }),
                'number.min': req.t('validation.number_min', {
                    attribute: req.trans.cruds.TIER.fields.listingDurationDays,
                    min: 0,
                }),
                'number.max': req.t('validation.number_max', {
                    attribute: req.trans.cruds.TIER.fields.listingDurationDays,
                    max: 365,
                }),
                'any.required': req.t('validation.number_required', {
                    attribute: req.trans.cruds.TIER.fields.listingDurationDays,
                }),
            }),

        annualSubscription: Joi.number()
            .min(0)
            .required()
            .messages({
                'number.base': req.t('validation.number_base', {
                    attribute: req.trans.cruds.TIER.fields.annualSubscription,
                }),
                'number.min': req.t('validation.number_min', {
                    attribute: req.trans.cruds.TIER.fields.annualSubscription,
                    min: 0,
                }),
                'any.required': req.t('validation.number_required', {
                    attribute: req.trans.cruds.TIER.fields.annualSubscription,
                }),
            }),

        applicableFeePercent: Joi.number()
            .min(0)
            .max(100)
            .required()
            .messages({
                'number.base': req.t('validation.number_base', {
                    attribute: req.trans.cruds.TIER.fields.applicableFeePercent,
                }),
                'number.min': req.t('validation.number_min', {
                    attribute: req.trans.cruds.TIER.fields.applicableFeePercent,
                    min: 0,
                }),
                'number.max': req.t('validation.number_max', {
                    attribute: req.trans.cruds.TIER.fields.applicableFeePercent,
                    max: 100,
                }),
                'any.required': req.t('validation.number_required', {
                    attribute: req.trans.cruds.TIER.fields.applicableFeePercent,
                }),
            }),

        maxFee: Joi.number()
            .min(0)
            .required()
            .messages({
                'number.base': req.t('validation.number_base', {
                    attribute: req.trans.cruds.TIER.fields.maxFee,
                }),
                'number.min': req.t('validation.number_min', {
                    attribute: req.trans.cruds.TIER.fields.maxFee,
                    min: 0,
                }),
                'any.required': req.t('validation.number_required', {
                    attribute: req.trans.cruds.TIER.fields.maxFee,
                }),
            }),

    }).unknown(true);

    const { error } = schema.validate(req.body, { abortEarly: false });

    const errors = {};

    if (error) {
        error.details.forEach(err => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }

    if (req.body.tierNumber) {
        const tierNumberKeys = Object.keys(constantKey.TIER.TIER_NUMBERS);
        if (!Object.values(tierNumberKeys).includes(req.body.tierNumber)) {
            errors.tierNumber = req.t('validation.invalid_value', {
                attribute: req.trans.cruds.TIER.fields.tierNumber
            });
        }
    }

    if (req.body.title_en) {
        const existingEn = await Tier.findOne({
            isDeleted: false,
            'title.en': { $regex: new RegExp('^' + req.body.title_en + '$', 'i') },
            _id: { $ne: id },
        });
        if (existingEn) {
            errors.title_en = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.TIER.fields.title_en });
        }
    }

    if (req.body.title_ar) {
        const existingAr = await Tier.findOne({
            isDeleted: false,
            'title.ar': { $regex: new RegExp('^' + req.body.title_ar + '$', 'i') },
            _id: { $ne: id },
        });
        if (existingAr) {
            errors.title_ar = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.TIER.fields.title_ar });
        }
    }

    return Object.keys(errors).length > 0 ? errors : null;
};

module.exports = { 
    addTierRequest, 
    editTierRequest 
};
