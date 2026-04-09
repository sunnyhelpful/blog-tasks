const Joi = require('joi');
const Role = require('../../models/role');
const Permission = require('../../models/permission');

const baseSchema = Joi.object({
    name: Joi.string()
        .trim()
        .required()
        .pattern(/^\S+(?:\s\S+)*$/, 'no multiple spaces')
        .messages({
            'string.empty': '{{#name}}',
            'string.pattern.name': '{{#noMultipleSpaces}}'
        }),
    permissions: Joi.array().items(Joi.string().length(24).required()).required().messages({
        'array.base': '{{#permissions}}',
        'array.empty': '{{#permissions}}',
    })
}).unknown(true);

const handleValidationErrors = (error, req, errors) => {
    if (!error) return;
    
    error.details.forEach(err => {
        const key = err.context.key;
        if (err.type === 'string.pattern.name') {
            errors[key] = req.t(req.trans.validation.custom_message.multiple_space_not_allow, {});
        } else {
            errors[key] = req.t(err.type === 'string.empty' ? 
                'validation.string_required' : 
                'validation.array_required', 
                { attribute: req.trans.cruds.ROLE.fields[key] }
            );
        }
    });
};

const validatePermissions = async (permissions, req, errors) => {
    if (!Array.isArray(permissions)) {
        errors.permissions = req.t('validation.array_required', {
            attribute: req.trans.cruds.ROLE.fields.permissions
        });
        return;
    }

    const existingPermissions = await Permission.find({
        _id: { $in: permissions }
    }).select('_id');

    const validPermissionIds = new Set(
        existingPermissions.map(p => p._id.toString())
    );

    if (validPermissionIds.size !== permissions.length) {
        errors.permissions = req.t('validation.invalid_format', {
            attribute: req.trans.cruds.ROLE.fields.permissions
        });
    }
};

const validateRoleName = async (name, req, errors, existingId = null) => {
    const existingRole = await Role.findOne({ 
        name: { $regex: new RegExp('^' + name + '$', 'i') },
        isDeleted: false,
        deletedAt: null,
    });

    if (existingRole && (!existingId || existingRole._id.toString() !== existingId)) {
        errors.name = req.t('validation.duplicate_entry', {
            attribute: req.trans.cruds.ROLE.fields.name
        });
    }
};

const addRoleRequest = async (req) => {
    const errors = {};
    
    const schema = baseSchema.messages({
        'string.empty': req.t('validation.string_required', {
            attribute: req.trans.cruds.ROLE.fields.name
        }),
        'string.pattern.name': req.t('validation.no_multiple_spaces', {
            attribute: req.trans.cruds.ROLE.fields.name
        }),
        'array.base': req.t('validation.array_required', {
            attribute: req.trans.cruds.ROLE.fields.permissions
        }),
        'array.empty': req.t('validation.array_required', {
            attribute: req.trans.cruds.ROLE.fields.permissions
        })
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    handleValidationErrors(error, req, errors);

    await validateRoleName(req.body.name, req, errors);
    await validatePermissions(req.body.permissions, req, errors);

    return Object.keys(errors).length > 0 ? errors : null;
};

const editRoleRequest = async (req) => {
    const errors = {};
    const schema = baseSchema.messages({
        'string.empty': req.t('validation.string_required', {
            attribute: req.trans.cruds.ROLE.fields.name
        }),
        'string.pattern.name': req.t('validation.no_multiple_spaces', {
            attribute: req.trans.cruds.ROLE.fields.name
        }),
        'array.base': req.t('validation.array_required', {
            attribute: req.trans.cruds.ROLE.fields.permissions
        }),
        'array.empty': req.t('validation.array_required', {
            attribute: req.trans.cruds.ROLE.fields.permissions
        })
    });

    const { error } = schema.validate(req.body, { abortEarly: false });
    handleValidationErrors(error, req, errors);

    await validateRoleName(req.body.name, req, errors, req.params.id);
    await validatePermissions(req.body.permissions, req, errors);

    return Object.keys(errors).length > 0 ? errors : null;
};

module.exports = { addRoleRequest, editRoleRequest };