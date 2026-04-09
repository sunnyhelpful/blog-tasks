const Joi = require('joi');
const Category = require('../../models/category');
const handleMultipleSpaces = require('../../rules/handleMultipleSpaces');
const isValidLength = require('../../rules/isValidLength');
const isUnique = require('../../rules/isUnique');

const addCategoryRequest = async (req) => {
    const schema = Joi.object({
        category_en: Joi.string()
            .trim()
            .required()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
                'string.empty': req.t('validation.string_required', {
                    attribute: req.trans.cruds.CATEGORY.fields.category_en,
                }),
                'string.pattern.name': req.t(
                    req.trans.validation.custom_message.multiple_space_not_allow
                ),
            }),
        category_ar: Joi.string()
            .trim()
            .required()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
                'string.empty': req.t('validation.string_required', {
                    attribute: req.trans.cruds.CATEGORY.fields.category_ar,
                }),
                'string.pattern.name': req.t(
                    req.trans.validation.custom_message.multiple_space_not_allow
                ),
            }),
        // parent_category: Joi.string().optional(),
    }).unknown(true);

    const { error } = schema.validate(req.body, { abortEarly: false });
    const errors = {};
    if (error) {
        error.details.forEach((err) => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }
    const existingEn = await Category.findOne({
        isDeleted: false,
        // category_type: { $ne: 'category_type' },
        'title.en': { $regex: new RegExp('^' + req.body.category_en + '$', 'i') },
    });
    if (existingEn) {
        errors.category_en = req.t('validation.duplicate_entry', {
            attribute: req.trans.cruds.CATEGORY.fields.category_en,
        });
    }

    const existingAr = await Category.findOne({
        isDeleted: false,
        // category_type: { $ne: 'category_type' },
        'title.ar': { $regex: new RegExp('^' + req.body.category_ar + '$', 'i') },
    });
  
    if (existingAr) {
        errors.category_ar = req.t('validation.duplicate_entry', {
            attribute: req.trans.cruds.CATEGORY.fields.category_ar,
        });
    }

    if (req.body.parent_category) {
        const parentCategoryData = await Category.findById(req.body.parent_category);
        if (!parentCategoryData) {
            errors.parent_category = req.t(req.trans.validation.custom_message.does_not_exists, {
                attribute: req.trans.cruds.CATEGORY.fields.parent_category,
            });
        }
    }
    return Object.keys(errors).length > 0 ? errors : null;
};

const editCategoryRequest = async (req) => {
    const schema = Joi.object({
        category_en: Joi.string()
            .trim()
            .required()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
            'string.empty': req.t('validation.string_required', {
                attribute: req.trans.cruds.CATEGORY.fields.category_en,
            }),
            'string.pattern.name': req.t(req.trans.validation.custom_message.multiple_space_not_allow),
            }),
        category_ar: Joi.string()
            .trim()
            .required()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
            'string.empty': req.t('validation.string_required', {
                attribute: req.trans.cruds.CATEGORY.fields.category_ar,
            }),
            'string.pattern.name': req.t(req.trans.validation.custom_message.multiple_space_not_allow),
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
    const existingEn = await Category.findOne({
        _id: { $ne: id },
        isDeleted: false,
        // category_type: { $ne: req.body.category_type },
        'title.en': { $regex: new RegExp('^' + req.body.category_en + '$', 'i') },
    });
  
    if (existingEn) {
        errors.category_en = req.t('validation.duplicate_entry', {
            attribute: req.trans.cruds.CATEGORY.fields.category_en,
        });
    }

    const existingAr = await Category.findOne({
        _id: { $ne: id },
        isDeleted: false,
        // category_type: { $ne: 'category_type' },
        'title.ar': { $regex: new RegExp('^' + req.body.category_ar + '$', 'i') },
    });

    if (existingAr) {
        errors.category_ar = req.t('validation.duplicate_entry', {
            attribute: req.trans.cruds.CATEGORY.fields.category_ar,
        });
    }

    if (req.body.parent_category) {
        const parentCategoryData = await Category.findById(req.body.parent_category);
        if (!parentCategoryData) {
            errors.parent_category = req.t(req.trans.validation.custom_message.does_not_exists, {
            attribute: req.trans.cruds.CATEGORY.fields.parent_category,
            });
        }
    }
    return Object.keys(errors).length > 0 ? errors : null;
};  

module.exports = { addCategoryRequest, editCategoryRequest };
