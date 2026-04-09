const Joi = require('joi');
const CategoryType = require('../../models/categoriesType');

const addCategoryTypeRequest = async (req) => {
    const schema = Joi.object({
        title_en: Joi.string()
            .trim()
            .required()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
                'string.empty': req.t('validation.string_required', {
                    attribute: req.trans.cruds.CATEGORY_TYPE.fields.title_en,
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
                    attribute: req.trans.cruds.CATEGORY_TYPE.fields.title_ar,
                }),
                'string.pattern.name': req.t(
                    req.trans.validation.custom_message.multiple_space_not_allow
                ),
            }),
    }).unknown(true);

    const { error } = schema.validate(req.body, { abortEarly: false });
    const errors = {};
    if (error) {
        error.details.forEach((err) => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }
    const existingEn = await CategoryType.findOne({
        isDeleted: false,
        category_type: 'category_type',
        'title.en': { $regex: new RegExp('^' + req.body.title_en + '$', 'i') },
    });
    if (existingEn) {
        errors.title_en = req.t('validation.duplicate_entry', {
            attribute: req.trans.cruds.CATEGORY_TYPE.fields.title_en,
        });
    }

    const existingAr = await CategoryType.findOne({
        isDeleted: false,
        category_type: 'category_type',
        'title.ar': { $regex: new RegExp('^' + req.body.title_ar + '$', 'i') },
    });

    if (existingAr) {
        errors.title_ar = req.t('validation.duplicate_entry', {
            attribute: req.trans.cruds.CATEGORY_TYPE.fields.title_ar,
        });
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
};

const editCategoryTypeRequest = async (req) => {
    const schema = Joi.object({
        title_en: Joi.string()
            .trim()
            .required()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
                'string.empty': req.t('validation.string_required', {
                    attribute: req.trans.cruds.CATEGORY_TYPE.fields.title_en,
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
                    attribute: req.trans.cruds.CATEGORY_TYPE.fields.title_ar,
                }),
                'string.pattern.name': req.t(
                    req.trans.validation.custom_message.multiple_space_not_allow
                ),
            }),
    }).unknown(true);
  
    const { error } = schema.validate(req.body, { abortEarly: false });
  
    const errors = {};
    if (error) {
        error.details.forEach((err) => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }

    const { id } = req.params;
    const existingEn = await CategoryType.findOne({
        _id: { $ne: id },
        isDeleted: false,
        category_type: 'category_type',
        'title.en': { $regex: new RegExp('^' + req.body.title_en + '$', 'i') },
    });
  
    if (existingEn) {
        errors.title_en = req.t('validation.duplicate_entry', {
            attribute: req.trans.cruds.CATEGORY_TYPE.fields.title_en,
        });
    }

    const existingAr = await CategoryType.findOne({
        _id: { $ne: id },
        isDeleted: false,
        category_type: 'category_type',
        'title.ar': { $regex: new RegExp('^' + req.body.title_ar + '$', 'i') },
    });

    if (existingAr) {
        errors.title_ar = req.t('validation.duplicate_entry', {
            attribute: req.trans.cruds.CATEGORY_TYPE.fields.title_ar,
        });
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
};  

module.exports = { addCategoryTypeRequest, editCategoryTypeRequest };
