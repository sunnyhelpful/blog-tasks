const Brand = require("../../models/brand");
const { prepareMongooseDataTablesParams } = require("../../utils/helper");
const brandTransformer = require('../../transformers/backend/brandTransformer');
const { addBrandRequest, editBrandRequest } = require('../../requests/backend/brandRequest');
const { ObjectId } = require('mongoose').Types;
const { saveUpload } = require('../../utils/saveUpload');
const { successResponse, errorResponse, internalServerErrorResponse } = require('../../utils/apiResponses');

/**
 * Show a list of all brands with pagination, sorting, and search
 */
async function index(req, res) {
    try {
        if (!req.xhr && !req.headers.accept.includes('json')) {
            return res.render('backend/brands/index');
        }

        const { pageSize, pageStart, searchFilter, sortColumn, sortOrder } = prepareMongooseDataTablesParams(req, ['title', 'createdAt'], Brand.schema);
        const finalSortColumn = sortColumn || 'createdAt';
        const finalSortOrder = sortOrder === 'ASC' ? 1 : -1;

        const totalCount = await Brand.countDocuments({ isDeleted: false });
        const filteredCount = await Brand.countDocuments({ isDeleted: false, ...searchFilter });

        const brands = await Brand.find({ isDeleted: false, ...searchFilter })
            .skip(pageStart)
            .limit(pageSize)
            .sort({ [finalSortColumn]: finalSortOrder });

        const transformedBrands = brandTransformer.transformCollection(brands, req.session.lang);

        return res.json({
            draw: parseInt(req.query.draw) || 1,
            recordsTotal: totalCount,
            recordsFiltered: filteredCount,
            data: transformedBrands,
        });
    } catch (error) {
        console.error('Error fetching brands:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.BRAND,
            })
        ));
    }
}

/**
 * Render the form to create a new brand
 */
async function create(req, res) {
    try {
        return res.render("backend/brands/create", {
            brand: {},
        });
    } catch (error) {
        console.error("Error rendering brand creation form:", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.BRAND,
            })
        ));
    }
}

/**
 * Store a new brand in the database
 */
async function store(req, res) {
    const validationErrors = await addBrandRequest(req);
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
    
        const brandData = new Brand({
            title,
            description,
            createdBy: req.user._id,
            isVerification: "approved",
        });
        const storeBrand = await Brand.create(brandData);

        let fileMetadata = null;
        if (req.files) {
            const isS3 = !!process.env.AWS_SDK_API_KEY && !!process.env.AWS_SDK_API_SECRET_KEY;
            if (req.files?.brand_image?.[0]) {
                fileMetadata = await saveUpload(storeBrand._id, 'Brand', req.files?.brand_image?.[0], 'brand_image', isS3);
            }
            if (req.files?.brand_icon?.[0]) {
                fileMetadata = await saveUpload(storeBrand._id, 'Brand', req.files?.brand_icon?.[0], 'brand_icon', isS3);
            }
        }
        
        const url = req.body.save_continue == 1 ? '/admin/brand/create' : '/admin/brands';
        return res.status(201).json(successResponse(
            req.t(req.trans.messages.add_success_message, {
                attribute : req.trans.cruds.MODULE.BRAND
            }), { storeBrand,
        }, null, null, url));
    } catch (error) {
        console.error('Error creating brand:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.BRAND,
            })
        ));
    }
}

/**
 * Show a single brand by ID
 */
async function show(req, res) {
    try {
        const { id } = req.params;
        const filter = {
            _id: id,
            isDeleted: false,
        }

        const brandDoc = await Brand.findOne(filter).populate('brand_image').populate('brand_icon');
        if(!brandDoc){
            req.flash("error_with_popup", req.t(req.trans.messages.not_found, {
                attribute: req.trans.cruds.MODULE.BRAND,
            }));
            return res.redirect('/admin/brands');
        }
        
        const brand = {
            ...brandDoc.toObject(),
            title: Object.fromEntries(brandDoc.title),
            description: Object.fromEntries(brandDoc.description),
        };

        return res.render("backend/brands/show", {
            brand,
        });
    } catch (error) {
        console.error("Error fetching brand: ", error);
        req.flash("error_with_popup", req.t(req.trans.messages.oops_something_went_wrong, {
            attribute: req.trans.cruds.MODULE.BRAND,
        }));
        return res.redirect('/admin/brands');
    }
}

/**
 * Render the form to edit an existing brand
 */
async function edit(req, res) {
    try {
        const { id } = req.params;
        const filter = {
            _id: id,
            isDeleted: false,
        }

        const brandDoc = await Brand.findOne(filter).populate('brand_image').populate('brand_icon');
        if(!brandDoc){
            req.flash("error_with_popup", req.t(req.trans.messages.not_found, {
                attribute: req.trans.cruds.MODULE.BRAND,
            }));
            return res.redirect('/admin/brands');
        }
        
        const brand = {
            ...brandDoc.toObject(),
            title: Object.fromEntries(brandDoc.title),
            description: Object.fromEntries(brandDoc.description),
        };

        return res.render("backend/brands/edit", {
            brand,
        });
    } catch (error) {
        console.error("Error fetching brand for editing:", error);
        req.flash("error_with_popup", req.t(req.trans.messages.oops_something_went_wrong, {
            attribute: req.trans.cruds.MODULE.BRAND,
        }));
        return res.redirect('/admin/brands');
    }
}

/**
 * Update an existing brand by ID
 */
async function update(req, res) {
    const validationErrors = await editBrandRequest(req);
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

        const data = {
            title,
            description,
            updatedBy: req.user._id,
        };

        const updatedData = await Brand.findByIdAndUpdate(req.params.id, data, { new: true });

        let fileMetadata = null;
        if (req.files) {
            const isS3 = !!process.env.AWS_SDK_API_KEY && !!process.env.AWS_SDK_API_SECRET_KEY;
            if (req.files?.brand_image?.[0]) {
                fileMetadata = await saveUpload(updatedData._id, 'Brand', req.files?.brand_image?.[0], 'brand_image', isS3);
            }
            if (req.files?.brand_icon?.[0]) {
                fileMetadata = await saveUpload(updatedData._id, 'Brand', req.files?.brand_icon?.[0], 'brand_icon', isS3);
            }
        }
        
        const url = req.body.update_continue == 1 ? `/admin/brand/${req.params.id}/edit` : '/admin/brands';
        return res.status(200).json(successResponse(
            req.t(req.trans.messages.update_success_message, {
                attribute: req.trans.cruds.MODULE.BRAND
            }),{ updatedData 
        }, null, null, url)
        );
    } catch (error) {
        console.error("Error updating brand:", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.BRAND,
            })
        ));
    }
} 


/**
 * Soft delete a brand by ID
 */
async function destroy(req, res) {
    try {
        const brand = await Brand.findById(req.params.id);
        
        if (!brand || brand.isDeleted) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute : req.trans.cruds.MODULE.BRAND
                })
            ));
        }

        await brand.softDelete(req.user._id);
        return res.status(200).json(
        successResponse(
            req.t(req.trans.messages.delete_success_message, {
                attribute : req.trans.cruds.MODULE.BRAND
            }), {
            brand,
        }, null, null, '/admin/brands'));
    } catch (error) {
        console.error("Error deleting brand: ", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute : req.trans.cruds.MODULE.BRAND
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
                        attribute : req.trans.cruds.BRAND.fields.status,
                    })
                )
            );
        }

        await Brand.findByIdAndUpdate(id, { status });
        return res.status(200).json(
            successResponse(
                req.t(req.trans.messages.key_update, {
                    attribute : req.trans.cruds.MODULE.BRAND,
                    status : status,
                }), {}, null, null, null
            )
        );
    } catch (error) {
        console.error('Error while updating brands status:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute : req.trans.cruds.MODULE.BRAND
            })
        ));
    }
}

/* 
** verification Update..
*/
async function verificationUpdate(req, res) {
    try {
        const { isVerification } = req.body;
        const { id } = req.params;

        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(isVerification)) {
        return res.status(400).json(
            errorResponse(
                req.t(req.trans.messages.invalid_key, {
                    attribute : req.trans.cruds.BRAND.fields.verification,
                })
            )
        );
        }

        
        await Brand.findByIdAndUpdate(id, { isVerification });
        return res.status(200).json(successResponse(
            req.t(req.trans.messages.key_update, {
                attribute : req.trans.cruds.MODULE.BRAND,
                status : isVerification,
            }), {
        }, null, null, null));
    } catch (error) {
        console.error('Error while updating brand verifications:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute : req.trans.cruds.MODULE.BRAND
            })
        ));
    }
}


/*
** Import Brands 
*/
async function brandImport(req, res) {
    try {
        if (!req.excelData) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute : req.trans.cruds.MODULE.BRAND,
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
            description_en = '',
            description_ar = '',
            ] = row.map((v) => (typeof v === 'string' ? v.trim() : v));
    
            if (!title_en || !title_ar) continue;
    
            let brand = await Brand.findOne({
                isDeleted: false,
                $or: [
                    { 'title.en': new RegExp('^' + title_en + '$', 'i') },
                    { 'title.ar': new RegExp('^' + title_ar + '$', 'i') },
                ],
            });
    
            if (!brand) {
                brand = new Category({
                    title: { en: title_en, ar: title_ar },
                    description: { en: description_en, ar: description_ar },
                    createdBy: userId,
                    isVerification: "approved",
                });
                await brand.save();
                insertCount++;
            }
        }
    
        if(insertCount > 0){
            return res.status(200).json(successResponse(
                req.t(req.trans.messages.import_success_message, {
                    count : insertCount,
                    attribute : req.trans.cruds.MODULE.BRAND,
                }), { insertCount 
            }, null, null, null));
        } else {
            return res.status(200).json(errorResponse(
                req.t(req.trans.messages.import_success_message, {
                    count : insertCount,
                    attribute : req.trans.cruds.MODULE.BRAND,
                })
            ));
        }
    } catch (error) {
        console.error('Import Error:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute : req.trans.cruds.MODULE.BRAND
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
    verificationUpdate,
    brandImport
};
