const Joi = require('joi');
const Tag = require('../../models/tag');
const constant = require('../../config/constant');

const addTagRequest = async (req) => {
    const schema = Joi.object({
        title_en: Joi.string()
            .trim()
            .required()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
                'string.empty': req.t('validation.string_required', {
                    attribute: req.trans.cruds.TAG.fields.title_en,
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
                    attribute: req.trans.cruds.TAG.fields.title_ar,
                }),
                'string.pattern.name': req.t(
                    req.trans.validation.custom_message.multiple_space_not_allow
                ),
            }),

        visibility: Joi.string()
            .valid(...Object.values(constant.TAGS.VISIBILITY))
            .default(constant.TAGS.VISIBILITY.PUBLIC)
            .messages({
                'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.TAG.fields.visibility }),
            }),
        
    }).unknown(true);

    const { error } = schema.validate(req.body, { abortEarly: false });
    const errors = {};
    if (error) {
        error.details.forEach((err) => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }

    if(req.body.title_en){
        const existingEn = await Tag.findOne({
            isDeleted: false,
            'title.en': { $regex: new RegExp('^' + req.body.title_en + '$', 'i') },
        });
        if (existingEn) {
            errors.title_en = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.TAG.fields.title_en });
        }
    }

    if(req.body.title_ar){
        const existingAr = await Tag.findOne({
            isDeleted: false,
            'title.ar': { $regex: new RegExp('^' + req.body.title_ar + '$', 'i') },
        });
        if (existingAr) {
            errors.title_ar = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.TAG.fields.title_ar });
        }
    }

    if (Array.isArray(req.body.relatedTags)) {
        const invalidTags = await Promise.all(
            req.body.relatedTags.map(async (id) => {
                const tag = await Tag.findById(id);
                return tag ? null : id;
            })
        );
    
        const notFound = invalidTags.filter(id => id !== null);
        if (notFound.length > 0) {
            errors.relatedTags = req.t(req.trans.validation.custom_message.does_not_exists, {
                attribute: req.trans.cruds.TAG.fields.relatedTags,
            });
        }
    } else if (req.body.relatedTags) {
        const tag = await Tag.findById(req.body.relatedTags);
        if (!tag) {
            errors.relatedTags = req.t(req.trans.validation.custom_message.does_not_exists, {
                attribute: req.trans.cruds.TAG.fields.relatedTags,
            });
        }
    }

    if(req.body.parentTag){
        const parentTagData = await Tag.findById(req.body.parentTag);
        if (!parentTagData) {
            errors.parentTag = req.t(req.trans.validation.custom_message.does_not_exists, {
                attribute: req.trans.cruds.TAG.fields.parentTag,
            });
        }
    }

    return Object.keys(errors).length > 0 ? errors : null;
};


const editTagRequest = async (req) => {
    const schema = Joi.object({
        title_en: Joi.string()
            .trim()
            .required()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
                'string.empty': req.t('validation.string_required', {
                    attribute: req.trans.cruds.TAG.fields.title_en,
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
                    attribute: req.trans.cruds.TAG.fields.title_ar,
                }),
                'string.pattern.name': req.t(
                    req.trans.validation.custom_message.multiple_space_not_allow
                ),
            }),

        visibility: Joi.string()
            .valid(...Object.values(constant.TAGS.VISIBILITY))
            .default(constant.TAGS.VISIBILITY.PUBLIC)
            .messages({
                'string.empty': req.t('validation.string_required', { attribute: req.trans.cruds.TAG.fields.visibility }),
            }),
        
    }).unknown(true);

    const { error } = schema.validate(req.body, { abortEarly: false });
    const errors = {};
    if (error) {
        error.details.forEach((err) => {
            errors[err.context.key] = err.message.replace(/\"/g, '');
        });
    }

    const tagId = req.params.id;

    if(req.body.title_en){
        const existingEn = await Tag.findOne({
            _id: { $ne: tagId },
            isDeleted: false,
            'title.en': { $regex: new RegExp('^' + req.body.title_en + '$', 'i') },
        });
        if (existingEn) {
            errors.title_en = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.TAG.fields.title_en });
        }
    }

    if(req.body.title_ar){
        const existingAr = await Tag.findOne({
            _id: { $ne: tagId },
            isDeleted: false,
            'title.ar': { $regex: new RegExp('^' + req.body.title_ar + '$', 'i') },
        });
        if (existingAr) {
            errors.title_ar = req.t('validation.duplicate_entry', { attribute: req.trans.cruds.TAG.fields.title_ar });
        }
    }

    if (Array.isArray(req.body.relatedTags)) {
        const invalidTags = await Promise.all(
            req.body.relatedTags.map(async (id) => {
                const tag = await Tag.findById(id);
                return tag ? null : id;
            })
        );
    
        const notFound = invalidTags.filter(id => id !== null);
        if (notFound.length > 0) {
            errors.relatedTags = req.t(req.trans.validation.custom_message.does_not_exists, {
                attribute: req.trans.cruds.TAG.fields.relatedTags,
            });
        }
    } else if (req.body.relatedTags) {
        const tag = await Tag.findById(req.body.relatedTags);
        if (!tag) {
            errors.relatedTags = req.t(req.trans.validation.custom_message.does_not_exists, {
                attribute: req.trans.cruds.TAG.fields.relatedTags,
            });
        }
    }
    

    if(req.body.parentTag){
        const parentTagData = await Tag.findById(req.body.parentTag);
        if (!parentTagData) {
            errors.parentTag = req.t(req.trans.validation.custom_message.does_not_exists, {
                attribute: req.trans.cruds.TAG.fields.parentTag,
            });
        }
    }

    return Object.keys(errors).length > 0 ? errors : null;

    return Object.keys(errors).length > 0 ? errors : null;
};  

module.exports = { addTagRequest, editTagRequest };