const Attribute = require("../../models/attribute");
const { prepareMongooseDataTablesParams } = require("../../utils/helper");
const attributeTransformer = require('../../transformers/backend/attributeTransformer');
const { 
    addAttributeRequest, 
    editAttributeRequest 
} = require('../../requests/backend/attributeRequest');
const { 
  ObjectId 
} = require('mongoose').Types;
const {
  saveUpload
} = require('../../utils/saveUpload');
const {
  successResponse,
  errorResponse,
  internalServerErrorResponse,
} = require('../../utils/apiResponses');
const constant = require('../../config/constant');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

/**
 * Show a list of all attributes
 */
async function index(req, res) {
    try {
        if (!req.xhr && !req.headers.accept.includes('json')) {
            return res.render('backend/attributes/index');
        }

        const { pageSize, pageStart, searchFilter, sortColumn, sortOrder } = prepareMongooseDataTablesParams(req, ['title', 'createdAt'], Attribute.schema);
        
        if (req.query.status) {
            searchFilter.status = req.query.status;
        }
        
        const finalSortColumn = sortColumn || 'createdAt';
        const finalSortOrder = sortOrder === 'ASC' ? 1 : -1;
    
        const totalCount = await Attribute.countDocuments({ isDeleted: false });
        const filteredCount = await Attribute.countDocuments({ isDeleted: false, ...searchFilter });
    
        const attributes = await Attribute.find({ isDeleted: false, ...searchFilter })
            .skip(pageStart)
            .limit(pageSize)
            .sort({ [finalSortColumn]: finalSortOrder });

        const transformedAttributes = attributeTransformer.transformCollection(attributes, req.session.lang);

        return res.json({
            draw: parseInt(req.query.draw) || 1,
            recordsTotal: totalCount,
            recordsFiltered: filteredCount,
            data: transformedAttributes,
        });
    } catch (error) {
        console.error('Error fetching attributes:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute : req.trans.cruds.MODULE.ATTRIBUTE
            })
        ));
    }
}

/**
 * Create a role
 */
async function create(req, res) {
    try {
        return res.render("backend/attributes/create", {
            attribute: {},
            attributeTypes: constant.ATTRIBUTES.TYPES,
        });
    } catch (error) {
        req.flash("error_with_popup", req.t(
            req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.USER, 
            })
        );
        return res.redirect('/admin/users');
    }
}
/**
 * Store a new category in the database
 */
async function store(req, res) {
    const validationErrors = await addAttributeRequest(req);
    if (validationErrors) {
        return res.status(400).json(errorResponse(req.trans.messages.validation_error, validationErrors));
    }

    try {
        const {
            title_en, title_ar, type,
            description_en, description_ar,
            label_en, label_ar,
            placeholder_en, placeholder_ar,
            option1_en, option1_ar,
            option2_en, option2_ar
        } = req.body;

        const title = { en: title_en, ar: title_ar };
        const description = {
            en: decodeURIComponent(description_en || ''),
            ar: decodeURIComponent(description_ar || '')
        };
        const label = { en: label_en, ar: label_ar };
        const placeholder = {};
        if (placeholder_en) placeholder.en = placeholder_en;
        if (placeholder_ar) placeholder.ar = placeholder_ar;

        const attribute = await Attribute.create({
            title,
            description,
            type,
            label,
            placeholder,
            createdBy: req.user._id,
            isVerification: "approved"
        });

        const attributeId = attribute._id;

        let options = [];

        switch (type) {
            case 'boolean':
                options = [
                    {
                        value: { en: option1_en, ar: option1_ar },
                        meta: {}
                    },
                    {
                        value: { en: option2_en, ar: option2_ar },
                        meta: {}
                    }
                ];
                break;

            case 'radio':
            case 'checkbox':
            case 'singleimageuploader':
            case 'multipleimageuploader':
            case 'singleselectdropdown':
            case 'singleselectdropdownwithsearch':
            case 'multipleselectdropdown':
            case 'multipleselectdropdownwithsearch':
            case 'toggleswitchtitle':
            case 'toggleswitchtitleinput': {
                const optionEn = req.body.option_en || [];
                const optionAr = req.body.option_ar || [];

                if (Array.isArray(optionEn) && Array.isArray(optionAr) && optionEn.length === optionAr.length) {
                    options = optionEn.map((en, index) => ({
                        value: {
                            en,
                            ar: optionAr[index]
                        },
                        meta: {}
                    }));
                } else {
                    return res.status(400).json(errorResponse(req.trans.messages.validation_error, {
                        options: 'Option labels in English and Arabic must be provided in matching pairs.'
                    }));
                }
                break;
            }
            case 'radioimage':
            case 'checkboximage': {
                let filesEn = req.files['option_en[]'] || [];
                let filesAr = req.files['option_ar[]'] || [];
                let optionEnLabels = req.body.option_en || [];
                let optionArLabels = req.body.option_ar || [];

                if (!Array.isArray(optionEnLabels)) optionEnLabels = [];
                if (!Array.isArray(optionArLabels)) optionArLabels = [];

                while (optionArLabels.length < optionEnLabels.length) {
                    optionArLabels.push('');
                }

                const cloneIndexes = Object.keys(req.body)
                    .filter(key => key.startsWith(`${type}_imageclonecheck_`))
                    .map(key => parseInt(key.split('_').pop()))
                    .sort((a, b) => a - b);

                cloneIndexes.forEach(index => {
                    const insertIndex = index - 1;
                    filesAr.splice(insertIndex, 0, null);
                    optionArLabels.splice(insertIndex, 0, '');
                });

                for (let i = 0; i < filesEn.length; i++) {
                    const fileMetaEn = await saveUpload(attributeId, 'AttributeOption', filesEn[i], 'option_image', false);

                    let fileMetaAr = null;

                    if (cloneIndexes.includes(i + 1)) {
                        fileMetaAr = fileMetaEn;
                    } else if (filesAr[i]) {
                        fileMetaAr = await saveUpload(attributeId, 'AttributeOption', filesAr[i], 'option_image', false);
                    }

                    const option = {
                        value: {
                            en: optionEnLabels[i] || null,
                            ar: optionArLabels[i] || null
                        },
                        meta: {
                            fileId_en: fileMetaEn._id,
                            fileUrl_en: fileMetaEn.file_url || fileMetaEn.file_path,
                            originalFileName_en: fileMetaEn.original_file_name,
                            mimetype_en: fileMetaEn.file_type,
                            isCloned: cloneIndexes.includes(i + 1)
                        }
                    };

                    if (fileMetaAr) {
                        option.meta.fileId_ar = fileMetaAr._id;
                        option.meta.fileUrl_ar = fileMetaAr.file_url || fileMetaAr.file_path;
                        option.meta.originalFileName_ar = fileMetaAr.original_file_name;
                        option.meta.mimetype_ar = fileMetaAr.file_type;
                    }

                    options.push(option);
                }
                break;
            }
            case 'radioimagetitle':
            case 'checkboximagetitle': {
                let filesEn = req.files['option_en[]'] || [];
                let filesAr = req.files['option_ar[]'] || [];
                let optionEnLabels = req.body.option_title_en || [];
                let optionArLabels = req.body.option_title_ar || [];

                if (!Array.isArray(optionEnLabels)) optionEnLabels = [];
                if (!Array.isArray(optionArLabels)) optionArLabels = [];

                while (optionArLabels.length < optionEnLabels.length) {
                    optionArLabels.push('');
                }

                const cloneIndexes = Object.keys(req.body)
                    .filter(key => key.startsWith(`${type}_imageclonecheck_`))
                    .map(key => parseInt(key.split('_').pop()))
                    .sort((a, b) => a - b);

                cloneIndexes.forEach(index => {
                    const insertIndex = index - 1;
                    filesAr.splice(insertIndex, 0, null);
                    // optionArLabels.splice(insertIndex, 0, '');
                });

                for (let i = 0; i < filesEn.length; i++) {
                    const fileMetaEn = await saveUpload(attributeId, 'AttributeOption', filesEn[i], 'option_image', false);

                    let fileMetaAr = null;

                    if (cloneIndexes.includes(i + 1)) {
                        fileMetaAr = fileMetaEn;
                    } else if (filesAr[i]) {
                        fileMetaAr = await saveUpload(attributeId, 'AttributeOption', filesAr[i], 'option_image', false);
                    }

                    const option = {
                        value: {
                            en: optionEnLabels[i] || null,
                            ar: optionArLabels[i] || null
                        },
                        meta: {
                            fileId_en: fileMetaEn._id,
                            fileUrl_en: fileMetaEn.file_url || fileMetaEn.file_path,
                            originalFileName_en: fileMetaEn.original_file_name,
                            mimetype_en: fileMetaEn.file_type,
                            isCloned: cloneIndexes.includes(i + 1)
                        }
                    };

                    if (fileMetaAr) {
                        option.meta.fileId_ar = fileMetaAr._id;
                        option.meta.fileUrl_ar = fileMetaAr.file_url || fileMetaAr.file_path;
                        option.meta.originalFileName_ar = fileMetaAr.original_file_name;
                        option.meta.mimetype_ar = fileMetaAr.file_type;
                    }

                    options.push(option);
                }
                break;
            }
            default:
                break;
        }

        attribute.options = options;
        await attribute.save();

        const url = req.body.save_continue == 1 ? '/admin/attribute/create' : '/admin/attributes';

        return res.status(201).json(successResponse(
            req.t(req.trans.messages.add_success_message, {
                attribute: req.trans.cruds.MODULE.ATTRIBUTE
            }),
            { attributeData: attribute },
            null, null, url
        ));
    } catch (error) {
        logInfo('Error creating attribute :', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.ATTRIBUTE
            })
        ));
    }
}

/**
 * Show a single attribute by ID
 */
async function show(req, res) {
    try {
        const { id } = req.params;
        const attributeDoc = await Attribute.findById(id).lean();

        if (!attributeDoc || attributeDoc.isDeleted) {
            req.flash("error_with_popup", req.t(
                req.trans.messages.not_found, {
                attribute: req.trans.cruds.MODULE.ATTRIBUTE,
                })
            );
            return res.redirect('/admin/attributes');
        }

        const attribute = {
            _id: attributeDoc._id,
            title: attributeDoc.title || {},
            description: attributeDoc.description || {},
            type: attributeDoc.type,
            status: attributeDoc.status,
            label: attributeDoc.label || {},
            placeholder: attributeDoc.placeholder || {},
            isRequired: attributeDoc.isRequired,
            isFilterable: attributeDoc.isFilterable,
            options: Array.isArray(attributeDoc.options)
                ? attributeDoc.options.map(opt => ({
                    _id: opt._id,
                    value: opt.value || {},
                    meta: opt.meta || {},
                }))
                : [],
        };

        return res.render("backend/attributes/show", {
            attribute,
        });
    } catch (error) {
        console.error("Error fetching attribute: ", error);
        req.flash("error_with_popup", 
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.ATTRIBUTE,
            })
        );
        return res.redirect('/admin/attributes');
    }
}



/**
 * Render a form to edit an existing attribute
 */
async function edit(req, res) {
    try {
        const { id } = req.params;
        const attributeRaw = await Attribute.findOne({
            _id: id,
            isDeleted: false,
        }).lean();
        if (!attributeRaw || attributeRaw.length === 0) {
            req.flash("error_with_popup", req.t(req.trans.messages.not_found, {
                attribute: req.trans.cruds.MODULE.ATTRIBUTE,
            }));
            return res.redirect('/admin/attributes');
        }

        const attribute = {
            _id: attributeRaw._id,
            title: attributeRaw.title || {},
            description: attributeRaw.description || {},
            type: attributeRaw.type,
            status: attributeRaw.status,
            label: attributeRaw.label || {},
            placeholder: attributeRaw.placeholder || {},
            isRequired: attributeRaw.isRequired,
            isFilterable: attributeRaw.isFilterable,
            options: Array.isArray(attributeRaw.options)
                ? attributeRaw.options.map(opt => ({
                    _id: opt._id,
                    value: opt.value || {},
                    meta: opt.meta || {},
                }))
                : [],
        };

        logInfo('attribute..', attribute);

        return res.render("backend/attributes/edit", {
            attribute: attribute,
            attributeTypes: constant.ATTRIBUTES.TYPES,
        });
    } catch (error) {
        console.error("Error fetching attribute for editing: ", error);
        req.flash("error_with_popup", req.t(req.trans.messages.oops_something_went_wrong, {
            attribute: req.trans.cruds.MODULE.ATTRIBUTE,
        }));
        return res.redirect('/admin/attributes');
    }
}

/**
 * Update an existing attribute by ID
 */
async function update(req, res) {
    const validationErrors = await editAttributeRequest(req);
    if (validationErrors) {
        return res.status(400).json(errorResponse(req.trans.messages.validation_error, validationErrors));
    }

    /* logInfo(req.body);
    logInfo(req.files); */

    try {
        const { id } = req.params;
        const {
            title_en, title_ar, type,
            description_en, description_ar,
            label_en, label_ar,
            placeholder_en, placeholder_ar,
            option1_en, option1_ar,
            option2_en, option2_ar
        } = req.body;

        const title = { en: title_en, ar: title_ar };
        const description = {
            en: decodeURIComponent(description_en || ''),
            ar: decodeURIComponent(description_ar || '')
        };
        const label = { en: label_en, ar: label_ar };
        const placeholder = {};
        if (placeholder_en) placeholder.en = placeholder_en;
        if (placeholder_ar) placeholder.ar = placeholder_ar;

        const updateData = {
            title,
            description,
            type,
            label,
            placeholder,
            updatedBy: req.user._id,
        };

        const attribute = await Attribute.findById(id);
        if (!attribute) {
            return res.status(404).json(errorResponse('Attribute not found'));
        }

        const updatedAttribute = await Attribute.findByIdAndUpdate(id, updateData, { new: true });

        let options = [];

        switch (type) {
            case 'boolean':
                options = [
                    { value: { en: option1_en, ar: option1_ar }, meta: {} },
                    { value: { en: option2_en, ar: option2_ar }, meta: {} }
                ];
                break;

            case 'radio':
            case 'checkbox':
            case 'singleimageuploader':
            case 'multipleimageuploader':
            case 'singleselectdropdown':
            case 'singleselectdropdownwithsearch':
            case 'multipleselectdropdown':
            case 'multipleselectdropdownwithsearch':
            case 'toggleswitchtitle':
            case 'toggleswitchtitleinput': {
                const optionEn = req.body.option_en || [];
                const optionAr = req.body.option_ar || [];

                if (Array.isArray(optionEn) && Array.isArray(optionAr) && optionEn.length === optionAr.length) {
                    options = optionEn.map((en, index) => ({
                        value: {
                            en,
                            ar: optionAr[index]
                        },
                        meta: {}
                    }));
                } else {
                    return res.status(400).json(errorResponse(req.trans.messages.validation_error, {
                        options: 'Option labels in English and Arabic must be provided in matching pairs.'
                    }));
                }
                break;
            }

            case 'radioimage':
            case 'checkboximage': {
                let filesEn = req.files['option_en[]'] || [];
                let filesAr = req.files['option_ar[]'] || [];
                let existingFilesEn = req.body.existing_option_en || [];
                let existingFilesAr = req.body.existing_option_ar || [];
                let optionEnLabels = req.body.option_en || [];
                let optionArLabels = req.body.option_ar || [];

                if (!Array.isArray(optionEnLabels)) optionEnLabels = [];
                if (!Array.isArray(optionArLabels)) optionArLabels = [];
                if (!Array.isArray(existingFilesEn)) existingFilesEn = [];
                if (!Array.isArray(existingFilesAr)) existingFilesAr = [];

                while (optionArLabels.length < optionEnLabels.length) {
                    optionArLabels.push('');
                }

                const cloneIndexes = Object.keys(req.body)
                    .filter(key => key.startsWith(`${type}_imageclonecheck_`))
                    .map(key => parseInt(key.split('_').pop()))
                    .sort((a, b) => a - b);

                for (let i = 0; i < existingFilesEn.length; i++) {
                    const existingOption = attribute.options[i] || {};
                    const existingFileEn = existingFilesEn[i];
                    let existingFileAr = existingFilesAr[i] || null;

                    if (cloneIndexes.includes(i + 1)) {
                        existingFileAr = existingFileEn;
                    }

                    const option = {
                        value: {
                            en: optionEnLabels[i] || existingOption.value?.en || null,
                            ar: optionArLabels[i] || existingOption.value?.ar || null
                        },
                        meta: {
                            fileId_en: existingOption.meta?.fileId_en || null,
                            fileUrl_en: existingFileEn,
                            originalFileName_en: existingFileEn.split('/').pop(),
                            mimetype_en: existingOption.meta?.mimetype_en || 'image/jpeg',
                            isCloned: cloneIndexes.includes(i + 1)
                        }
                    };

                    if (existingFileAr) {
                        option.meta.fileId_ar = cloneIndexes.includes(i + 1) 
                            ? existingOption.meta?.fileId_en 
                            : existingOption.meta?.fileId_ar || null;
                        option.meta.fileUrl_ar = existingFileAr;
                        option.meta.originalFileName_ar = existingFileAr.split('/').pop();
                        option.meta.mimetype_ar = cloneIndexes.includes(i + 1) 
                            ? existingOption.meta?.mimetype_en 
                            : existingOption.meta?.mimetype_ar || 'image/jpeg';
                    }

                    options.push(option);
                }

                for (let i = 0; i < filesEn.length; i++) {
                    const fileMetaEn = await saveUpload(id, 'AttributeOption', filesEn[i], 'option_image', false);

                    let fileMetaAr = null;
                    const optionIndex = existingFilesEn.length + i;

                    if (cloneIndexes.includes(optionIndex + 1)) {
                        fileMetaAr = fileMetaEn;
                    } else if (filesAr[i]) {
                        fileMetaAr = await saveUpload(id, 'AttributeOption', filesAr[i], 'option_image', false);
                    }

                    const option = {
                        value: {
                            en: optionEnLabels[optionIndex] || null,
                            ar: optionArLabels[optionIndex] || null
                        },
                        meta: {
                            fileId_en: fileMetaEn._id,
                            fileUrl_en: fileMetaEn.file_url || fileMetaEn.file_path,
                            originalFileName_en: fileMetaEn.original_file_name,
                            mimetype_en: fileMetaEn.file_type,
                            isCloned: cloneIndexes.includes(optionIndex + 1)
                        }
                    };

                    if (fileMetaAr) {
                        option.meta.fileId_ar = fileMetaAr._id;
                        option.meta.fileUrl_ar = fileMetaAr.file_url || fileMetaAr.file_path;
                        option.meta.originalFileName_ar = fileMetaAr.original_file_name;
                        option.meta.mimetype_ar = fileMetaAr.file_type;
                    }

                    options.push(option);
                }
                break;
            }

            case 'radioimagetitle':
            case 'checkboximagetitle': {
                let filesEn = req.files['option_en[]'] || [];
                let filesAr = req.files['option_ar[]'] || [];
                let existingFilesEn = req.body.existing_option_en || [];
                let existingFilesAr = req.body.existing_option_ar || [];
                let optionEnLabels = req.body.option_title_en || [];
                let optionArLabels = req.body.option_title_ar || [];

                if (!Array.isArray(optionEnLabels)) optionEnLabels = [];
                if (!Array.isArray(optionArLabels)) optionArLabels = [];
                if (!Array.isArray(existingFilesEn)) existingFilesEn = [];
                if (!Array.isArray(existingFilesAr)) existingFilesAr = [];

                while (optionArLabels.length < optionEnLabels.length) {
                    optionArLabels.push('');
                }

                const cloneIndexes = Object.keys(req.body)
                    .filter(key => key.startsWith(`${type}_imageclonecheck_`))
                    .map(key => parseInt(key.split('_').pop()))
                    .sort((a, b) => a - b);

                const newArabicImagePositions = [];
                for (let i = 0; i < existingFilesEn.length; i++) {
                    if (!existingFilesAr[i] && !cloneIndexes.includes(i + 1)) {
                        newArabicImagePositions.push(i);
                    }
                }

                for (let i = 0; i < existingFilesEn.length; i++) {
                    const existingOption = attribute.options[i] || {};
                    const existingFileEn = existingFilesEn[i];
                    let existingFileAr = existingFilesAr[i] || null;

                    if (cloneIndexes.includes(i + 1)) {
                        existingFileAr = existingFileEn;
                    }

                    const option = {
                        value: {
                            en: optionEnLabels[i] || existingOption.value?.en || null,
                            ar: optionArLabels[i] || existingOption.value?.ar || null
                        },
                        meta: {
                            fileId_en: existingOption.meta?.fileId_en || null,
                            fileUrl_en: existingFileEn,
                            originalFileName_en: existingOption.meta?.originalFileName_en || existingFileEn.split('/').pop(),
                            mimetype_en: existingOption.meta?.mimetype_en || 'image/jpeg',
                            isCloned: cloneIndexes.includes(i + 1)
                        }
                    };

                    if (existingFileAr) {
                        option.meta.fileId_ar = cloneIndexes.includes(i + 1) 
                            ? existingOption.meta?.fileId_en 
                            : existingOption.meta?.fileId_ar || null;
                        option.meta.fileUrl_ar = existingFileAr;
                        option.meta.originalFileName_ar = cloneIndexes.includes(i + 1)
                            ? existingOption.meta?.originalFileName_en
                            : existingOption.meta?.originalFileName_ar || existingFileAr.split('/').pop();
                        option.meta.mimetype_ar = cloneIndexes.includes(i + 1) 
                            ? existingOption.meta?.mimetype_en 
                            : existingOption.meta?.mimetype_ar || 'image/jpeg';
                    }

                    options.push(option);
                }

                let arabicFileIndex = 0;
                for (let i = 0; i < newArabicImagePositions.length && arabicFileIndex < filesAr.length; i++) {
                    const position = newArabicImagePositions[i];
                    const fileMetaAr = await saveUpload(id, 'AttributeOption', filesAr[arabicFileIndex], 'option_image', false);
                    arabicFileIndex++;

                    if (options[position]) {
                        options[position].meta.fileId_ar = fileMetaAr._id;
                        options[position].meta.fileUrl_ar = fileMetaAr.file_url || fileMetaAr.file_path;
                        options[position].meta.originalFileName_ar = fileMetaAr.original_file_name;
                        options[position].meta.mimetype_ar = fileMetaAr.file_type;
                    }
                }

                for (let i = 0; i < filesEn.length; i++) {
                    const optionIndex = existingFilesEn.length + i;
                    if (optionIndex >= options.length) {
                        const fileMetaEn = await saveUpload(id, 'AttributeOption', filesEn[i], 'option_image', false);

                        let fileMetaAr = null;
                        if (filesAr[arabicFileIndex]) {
                            fileMetaAr = await saveUpload(id, 'AttributeOption', filesAr[arabicFileIndex], 'option_image', false);
                            arabicFileIndex++;
                        }

                        const option = {
                            value: {
                                en: optionEnLabels[optionIndex] || null,
                                ar: optionArLabels[optionIndex] || null
                            },
                            meta: {
                                fileId_en: fileMetaEn._id,
                                fileUrl_en: fileMetaEn.file_url || fileMetaEn.file_path,
                                originalFileName_en: fileMetaEn.original_file_name,
                                mimetype_en: fileMetaEn.file_type,
                                isCloned: false
                            }
                        };

                        if (fileMetaAr) {
                            option.meta.fileId_ar = fileMetaAr._id;
                            option.meta.fileUrl_ar = fileMetaAr.file_url || fileMetaAr.file_path;
                            option.meta.originalFileName_ar = fileMetaAr.original_file_name;
                            option.meta.mimetype_ar = fileMetaAr.file_type;
                        }

                        options.push(option);
                    }
                }
                break;
            }

            default:
                break;
        }

        updatedAttribute.options = options;
        await updatedAttribute.save();

        const url = req.body.update_continue == 1 ? `/admin/attribute/${id}/edit` : '/admin/attributes';
        return res.status(200).json(successResponse(
            req.t(req.trans.messages.update_success_message, {
                attribute: req.trans.cruds.MODULE.ATTRIBUTE
            }), 
            { updatedAttribute },
            null, null, url
        ));
    } catch (error) {
        console.error("Error updating attribute:", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.ATTRIBUTE
            })
        ));
    }
}


/**
 * Soft delete a attribute by ID
 */
async function destroy(req, res) {
    try {
        const { id } = req.params;
        
        const attribute = await Attribute.findOne({ _id: id, isDeleted: false });
        if (!attribute) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute : req.trans.cruds.MODULE.ATTRIBUTE
                })
            ));
        }

        await attribute.softDelete(req.user._id);
        return res.json(successResponse(
            req.t(req.trans.messages.delete_success_message, {
                attribute : req.trans.cruds.ATTRIBUTE.title_singular
            }), { id }, null, null
        ));
    } catch (error) {
        console.error("Error deleting attribute: ", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute : req.trans.cruds.MODULE.ATTRIBUTE
            })
        ));
    }
}

async function statusUpdate(req, res) {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json(
                errorResponse(
                req.t(req.trans.messages.invalid_key, {
                    attribute: req.trans.cruds.ATTRIBUTE.fields.status,
                })
                )
            );
        }

        const attribute = await Attribute.findById(id);
        if (!attribute) {
            return res.status(404).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute: req.trans.cruds.ATTRIBUTE.fields.status,
                })
            ));
        }
        attribute.status = status;
        await attribute.save();
        return res.status(200).json(successResponse(
            req.t(req.trans.messages.key_update, {
                attribute: req.trans.cruds.MODULE.ATTRIBUTE,
                status: status,
            }), {}, 
        null, null, null));
    } catch (error) {
        console.error('Error while updating attribute status:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute : req.trans.cruds.MODULE.ATTRIBUTE
            })
        ));
    }
}

module.exports = {
    index,
    create,
    store,
    show,
    edit,
    update,
    destroy,
    statusUpdate
};