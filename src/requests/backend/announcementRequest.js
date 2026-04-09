const Joi = require('joi');
const Category = require('../../models/category');

const addAnnouncementRequest = async (req) => {
    const schema = Joi.object({
        title_en: Joi.string()
            .trim()
            .required()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
                'string.empty': req.t('validation.string_required', {
                    attribute: req.trans.cruds.ANNOUNCEMENT.fields.title_en,
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
                    attribute: req.trans.cruds.ANNOUNCEMENT.fields.title_ar,
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
    return Object.keys(errors).length > 0 ? errors : null;
};

const editAnnouncementRequest = async (req) => {
    const schema = Joi.object({
        title_en: Joi.string()
            .trim()
            .required()
            .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
            .messages({
                'string.empty': req.t('validation.string_required', {
                    attribute: req.trans.cruds.ANNOUNCEMENT.fields.title_en,
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
                    attribute: req.trans.cruds.ANNOUNCEMENT.fields.title_ar,
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

    return Object.keys(errors).length > 0 ? errors : null;
};  

module.exports = { addAnnouncementRequest, editAnnouncementRequest };
