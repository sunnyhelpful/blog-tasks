const Joi = require('joi');
const Attribute = require('../../models/attribute');
const  constant = require('../../config/constant');

const addAttributeRequest = async (req) => {
    const schema = Joi.object({
        title_en: Joi.string()
            .trim()
            .required()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
                'string.empty': req.t('validation.string_required', {
                    attribute: req.trans.cruds.ATTRIBUTE.fields.title_en,
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
                    attribute: req.trans.cruds.ATTRIBUTE.fields.title_ar,
                }),
                'string.pattern.name': req.t(
                    req.trans.validation.custom_message.multiple_space_not_allow
                ),
            }),
        type: Joi.string().trim().required().messages({
            'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.ATTRIBUTE.fields.type }),
        }),
        
    }).unknown(true);

    const { error } = schema.validate(req.body, { abortEarly: false });
    const errors = {};
    if (error) {
        error.details.forEach((err) => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }

    if(req.body.type){
        const attributeTypes =  constant.ATTRIBUTES.TYPES;
        if (!Object.values(attributeTypes).includes(req.body.type)) {
            errors.type = req.t('validation.invalid_value', { attribute: req.trans.cruds.ATTRIBUTE.fields.type });
        }
    }

    if(req.body.title_en){
        const existingEn = await Attribute.findOne({
            isDeleted: false,
            'title.en': { $regex: new RegExp('^' + req.body.title_en + '$', 'i') },
        });
        if (existingEn) {
            errors.title_en = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.ATTRIBUTE.fields.title_en });
        }
    }

    if(req.body.title_ar){
        const existingAr = await Attribute.findOne({
            isDeleted: false,
            'title.ar': { $regex: new RegExp('^' + req.body.title_ar + '$', 'i') },
        });
        if (existingAr) {
            errors.title_ar = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.ATTRIBUTE.fields.title_ar });
        }
    }
    return Object.keys(errors).length > 0 ? errors : null;
};

const editAttributeRequest = async (req) => {
    const schema = Joi.object({
        title_en: Joi.string()
            .trim()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
                'string.pattern.name': req.t(
                    req.trans.validation.custom_message.multiple_space_not_allow
                ),
            }),
        title_ar: Joi.string()
            .trim()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
                'string.pattern.name': req.t(
                    req.trans.validation.custom_message.multiple_space_not_allow
                ),
            }),
        type: Joi.string().trim().messages({
            'string.base': req.t('validation.string_required', { attribute: req.trans.cruds.ATTRIBUTE.fields.type }),
        }),
    }).unknown(true);

    const { error } = schema.validate(req.body, { abortEarly: false });
    const errors = {};
    if (error) {
        error.details.forEach((err) => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }

    if (req.body.type) {
        const attributeTypes = constant.ATTRIBUTES.TYPES;
        if (!Object.values(attributeTypes).includes(req.body.type)) {
            errors.type = req.t('validation.invalid_value', { attribute: req.trans.cruds.ATTRIBUTE.fields.type });
        }
    }

    if (req.body.title_en) {
        const existingEn = await Attribute.findOne({
            _id: { $ne: req.params.id },
            isDeleted: false,
            'title.en': { $regex: new RegExp('^' + req.body.title_en + '$', 'i') },
        });
        if (existingEn) {
            errors.title_en = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.ATTRIBUTE.fields.title_en });
        }
    }

    if (req.body.title_ar) {
        const existingAr = await Attribute.findOne({
            _id: { $ne: req.params.id },
            isDeleted: false,
            'title.ar': { $regex: new RegExp('^' + req.body.title_ar + '$', 'i') },
        });
        if (existingAr) {
            errors.title_ar = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.ATTRIBUTE.fields.title_ar });
        }
    }

    return Object.keys(errors).length > 0 ? errors : null;
};  

module.exports = { addAttributeRequest, editAttributeRequest };
