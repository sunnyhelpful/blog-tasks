const CategoryType = require("../../models/categoriesType");
const Upload = require("../../models/upload");
const { prepareMongooseDataTablesParams } = require("../../utils/helper");
const categoryTypeTransformer = require('../../transformers/backend/categoryTypeTransformer');
const { 
    addCategoryTypeRequest, 
    editCategoryTypeRequest 
} = require('../../requests/backend/categoryTypeRequest');
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
/**
 * Show a list of all category type
 */
async function index(req, res) {
    try {
        if (!req.xhr && !req.headers.accept.includes('json')) {
            return res.render('backend/categories-type/index');
        }
    
        const { pageSize, pageStart, searchFilter, sortColumn, sortOrder } = prepareMongooseDataTablesParams(req, ['title', 'createdAt'], CategoryType.schema);
        
        const finalSortColumn = sortColumn || 'createdAt';
        const finalSortOrder = sortOrder === 'ASC' ? 1 : -1;
        
        const totalCount = await CategoryType.countDocuments({ isDeleted: false, category_type: 'category_type' });
        const filteredCount = await CategoryType.countDocuments({ isDeleted: false, category_type: 'category_type', ...searchFilter });
        
        const categoriesType = await CategoryType.find({ isDeleted: false, category_type: 'category_type', ...searchFilter })
            .skip(pageStart)
            .limit(pageSize)
            .sort({ [finalSortColumn]: finalSortOrder });

        const transformedCategoriesType = categoryTypeTransformer.transformCollection(categoriesType, req.session.lang);
    
        return res.json({
            draw: parseInt(req.query.draw) || 1,
            recordsTotal: totalCount,
            recordsFiltered: filteredCount,
            data: transformedCategoriesType,
        });
    } catch (error) {
        logInfo('Error fetching categories type:', error);
        return res.status(500).json(internalServerErrorResponse('Failed to retrieve categories type'));
    }
}

/**
 * Create a user
 */
async function create(req, res) {
    try {
        return res.render("backend/categories-type/create", {
            category_type: {},
        });
    } catch (error) {
        console.error('Error preparing category type type creation:', error);
        req.flash("error_with_popup", req.t(
            req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.CATEGORY_TYPE, 
            })
        );
        return res.redirect('/admin/categories-type');
    }
}


/**
 * Store a new user
 */
async function store(req, res) {
    const validationErrors = await addCategoryTypeRequest(req);
    if (validationErrors) {
        return res.status(400).json(errorResponse(req.trans.messages.validation_error, validationErrors));
    }
    try {
        const {
            title_en,
            title_ar,
            description_en,
            description_ar,
        } = req.body;
        
        const title = {
            en: title_en,
            ar: title_ar
        };
    
        const description = {
            en: decodeURIComponent(description_en || ''),
            ar: decodeURIComponent(description_ar || '')
        };
    
        const categoryTypeData = new CategoryType({
            title,
            description,
            createdBy: req.user._id,
            category_type: 'category_type',
            isVerification: 'approved',
        });
        const storeCategoryType = await CategoryType.create(categoryTypeData);

        let fileMetadata = null;
        if (req.files) {
            const isS3 = !!process.env.AWS_SDK_API_KEY && !!process.env.AWS_SDK_API_SECRET_KEY;
            if (req.files?.category_type_image?.[0]) {
                fileMetadata = await saveUpload(storeCategoryType._id, 'CategoryType', req.files?.category_type_image?.[0], 'category_type_image', isS3);
            }
            if (req.files?.category_type_icon?.[0]) {
                fileMetadata = await saveUpload(storeCategoryType._id, 'CategoryType', req.files?.category_type_icon?.[0], 'category_type_icon', isS3);
            }
        }
        
        return res.status(201).json(successResponse(
            req.t(req.trans.messages.add_success_message, {
                attribute : req.trans.cruds.MODULE.CATEGORY_TYPE
            }), {
                storeCategoryType,
        }, null, null, '/admin/categories-type'));
    } catch (error) {
        console.error('Error creating categories type:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.BRAND,
            })
        ));
    }
}


/**
 * Show a specific user
 */
async function show(req, res) {
    try {
        const { id } = req.params;
        const filter = {
            _id: id,
            isDeleted: false,
            category_type: 'category_type',
        }

        const categoryTypeDoc = await CategoryType.findOne(filter).populate('category_type_image').populate('category_type_icon');
        if(!categoryTypeDoc){
            req.flash("error_with_popup", req.t(req.trans.messages.not_found, {
                attribute: req.trans.cruds.MODULE.CATEGORY_TYPE,
            }));
            return res.redirect('/admin/categories-type');
        }
        const category_type = {
            ...categoryTypeDoc.toObject(),
            title: Object.fromEntries(categoryTypeDoc.title),
            description: Object.fromEntries(categoryTypeDoc.description),
        };
        
        return res.render("backend/categories-type/show", {
            category_type,
        });
    } catch (error) {
        console.error('Error fetching category type:', error);
        req.flash("error_with_popup", req.t(
            req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.CATEGORY_TYPE, 
            })
        );
        return res.redirect('/admin/categories-type');
    }
}


/**
 * Display form data for editing a category type
 */
async function edit(req, res) {
    try {
        const { id } = req.params;
        const filter = {
            _id: id,
            isDeleted: false,
            category_type: 'category_type'
        }

        const categoryTypeDoc = await CategoryType.findOne(filter).populate('category_type_image').populate('category_type_icon');
        if(!categoryTypeDoc){
            req.flash("error_with_popup", req.t(req.trans.messages.not_found, {
                attribute: req.trans.cruds.MODULE.CATEGORY_TYPE,
            }));
            return res.redirect('/admin/categories-type');
        }
        const category_type = {
            ...categoryTypeDoc.toObject(),
            title: Object.fromEntries(categoryTypeDoc.title),
            description: Object.fromEntries(categoryTypeDoc.description),
        };
        
        return res.render("backend/categories-type/edit", {
            category_type,
        });
    } catch (error) {
        console.error('Error fetching category type for edit:', error);
        req.flash("error_with_popup", req.t(
            req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.CATEGORY_TYPE, 
            })
        );
        return res.redirect('/admin/categories-type');
    }
}


/**
 * Update a user
 */
async function update(req, res) {
    const validationErrors = await editCategoryTypeRequest(req);
    if (validationErrors) {
        return res.status(400).json(errorResponse(req.trans.messages.validation_error, validationErrors));
    }
    try {
        console.log(req.body);
        const {
            title_en,
            title_ar,
            description_en,
            description_ar,
        } = req.body;

        const title = {
            en: title_en,
            ar: title_ar
        };

        const description = {
            en: description_en,
            ar: description_ar
        };

        const data = {
            title,
            description,
            updatedBy: req.user._id,
            category_type: 'category_type',
            isVerification: 'approved',
        };

        const updatedData = await CategoryType.findByIdAndUpdate(req.params.id, data, { new: true });
        
        let fileMetadata = null;
        if (req.files) {
            const isS3 = !!process.env.AWS_SDK_API_KEY && !!process.env.AWS_SDK_API_SECRET_KEY;
            if (req.files?.category_type_image?.[0]) {
                fileMetadata = await saveUpload(updatedData._id, 'CategoryType', req.files?.category_type_image?.[0], 'category_type_image', isS3);
            }
            if (req.files?.category_type_icon?.[0]) {
                fileMetadata = await saveUpload(updatedData._id, 'CategoryType', req.files?.category_type_icon?.[0], 'category_type_icon', isS3);
            }
        }
        return res.status(200).json(successResponse(
            req.t(req.trans.messages.update_success_message, {
                attribute: req.trans.cruds.MODULE.CATEGORY_TYPE
            }),{ updatedData 
        }, null, null, '/admin/categories-type'));
    } catch (error) {
        console.error("Error updating categories type:", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
            attribute: req.trans.cruds.MODULE.CATEGORY_TYPE
            })
        ));
    }
}


/**
 * Soft delete a user
 */
async function destroy(req, res) {
    try {
        const categoryType = await CategoryType.findById(req.params.id);
        
        if (!categoryType || categoryType.isDeleted) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute: req.trans.cruds.MODULE.CATEGORY_TYPE
                })
            ));
        }

        await categoryType.softDelete(req.user._id);
        return res.status(200).json(successResponse(
            req.t(req.trans.messages.delete_success_message, {
                attribute: req.trans.cruds.MODULE.CATEGORY_TYPE
            }), { categoryType,
        }, null, null, '/admin/categories-type'));
    } catch (error) {
        console.error("Error deleting category type: ", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
            attribute: req.trans.cruds.MODULE.CATEGORY_TYPE
            })
        ));
    }
}

async function statusUpdate(req, res) {
    try {
        const { status } = req.body;
        const { id } = req.params;
        
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.invalid_key, {
                    attribute : req.trans.cruds.CATEGORY_TYPE.fields.status,
                }))
            );
        }

        await CategoryType.findByIdAndUpdate(id, { status });
        return res.status(200).json(successResponse(
            req.t(req.trans.messages.key_update, {
                attribute : req.trans.cruds.MODULE.CATEGORY_TYPE,
                status : status,
            }), {
        }, null, null, null));
    } catch (error) {
        console.error('Error while updating category type status:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute : req.trans.cruds.MODULE.CATEGORY_TYPE
            })
        ));
    }
}

/*
** Import Categories 
*/
async function categoryTypeImport(req, res) {
    try {
        if (!req.excelData) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute : req.trans.cruds.MODULE.CATEGORY_TYPE,
                }))
            );
        }

        const data = req.excelData;
        const userId = req.user._id;
        const requiredHeaders = [
            'Title (English)',
            'Title (Arabic)',
            'Description (English)',
            'Description (Arabic)',
        ];

        const header = data[0];
        const missingHeaders = requiredHeaders.filter(
            (headerName) => !header.includes(headerName)
        );

        if (missingHeaders.length > 0) {
            return res.status(400).json(errorResponse(req.trans.messages.missing_field_requireds + ' ' + missingHeaders.join(', ')));
        }
        
        let insertCount = 0;
        for (let index = 1; index < data.length; index++) {
            const row = data[index];

            const [
                , // S. No.
                title_en,
                title_ar,
                description_en,
                description_ar,
            ] = row.map((v) => (typeof v === 'string' ? v.trim() : v));

            if (!title_en || !title_ar) continue;

            let categoryType = await CategoryType.findOne({
                isDeleted: false,
                $or: [
                    { 'title.en': new RegExp('^' + title_en + '$', 'i') },
                    { 'title.ar': new RegExp('^' + title_ar + '$', 'i') },
                ],
            });

            if (!categoryType) {
                categoryType = new CategoryType({
                    title: { 
                        en: title_en, 
                        ar: title_ar 
                    },
                    description: { 
                        en: description_en || '', 
                        ar: description_ar || '' 
                    },
                    createdBy: userId,
                });
                await categoryType.save();
                insertCount++;
            }
        }

        if(insertCount > 0){
            return res.status(200).json(successResponse(
                req.t(req.trans.messages.import_success_message, {
                    count : insertCount,
                    attribute : req.trans.cruds.MODULE.CATEGORY_TYPE,
                }), { insertCount 
            }, null, null, null));
        } else {
        return res.status(200).json(errorResponse(
            req.t(req.trans.messages.import_success_message, {
                count : insertCount,
                attribute : req.trans.cruds.MODULE.CATEGORY_TYPE,
            })
        ));
        }
    } catch (error) {
        console.error('Import Error:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute : req.trans.cruds.MODULE.CATEGORY_TYPE
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
    statusUpdate,
    categoryTypeImport
};