const Advertisement = require("../../models/advertisement");
const { prepareMongooseDataTablesParams } = require("../../utils/helper");
const advertisementTransformer = require('../../transformers/backend/advertisementTransformer');
const { addAdvertisementRequest, editAdvertisementRequest } = require('../../requests/backend/advertisementRequest');
const { ObjectId } = require('mongoose').Types;
const { saveUpload } = require('../../utils/saveUpload');
const { successResponse, errorResponse, internalServerErrorResponse } = require('../../utils/apiResponses');

/**
 * Show a list of all advertisements with pagination, sorting, and search
 */
async function index(req, res) {
    try {
        if (!req.xhr && !req.headers.accept.includes('json')) {
            return res.render('backend/advertisements/index');
        }

        const { pageSize, pageStart, searchFilter, sortColumn, sortOrder } = prepareMongooseDataTablesParams(req, ['title', 'createdAt'], Advertisement.schema);
        const finalSortColumn = sortColumn || 'createdAt';
        const finalSortOrder = sortOrder === 'ASC' ? 1 : -1;

        const totalCount = await Advertisement.countDocuments({ isDeleted: false });
        const filteredCount = await Advertisement.countDocuments({ isDeleted: false, ...searchFilter });

        const advertisements = await Advertisement.find({ isDeleted: false, ...searchFilter })
            .skip(pageStart)
            .limit(pageSize)
            .sort({ [finalSortColumn]: finalSortOrder });

        const transformedAdvertisements = advertisementTransformer.transformCollection(advertisements, req.session.lang);

        return res.json({
            draw: parseInt(req.query.draw) || 1,
            recordsTotal: totalCount,
            recordsFiltered: filteredCount,
            data: transformedAdvertisements,
        });
    } catch (error) {
        console.error('Error fetching advertisements:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.ADVERTISEMENT,
            })
        ));
    }
}

/**
 * Render the form to create a new advertisement
 */
async function create(req, res) {
    try {
        return res.render("backend/advertisements/create", {
            advertisement: {},
        });
    } catch (error) {
        console.error("Error rendering advertisement creation form:", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.ADVERTISEMENT,
            })
        ));
    }
}

/**
 * Store a new advertisement in the database
 */
async function store(req, res) {
    const validationErrors = await addAdvertisementRequest(req);
    if (validationErrors) {
        return res.status(400).json(errorResponse(req.trans.messages.validation_error, validationErrors));
    }

    try {
        
    } catch (error) {
        console.error('Error creating advertisement:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.ADVERTISEMENT,
            })
        ));
    }
}

/**
 * Show a single advertisement by ID
 */
async function show(req, res) {
    try {
        
    } catch (error) {
        console.error("Error fetching advertisement:", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.ADVERTISEMENT,
            })
        ));
    }
}

/**
 * Render the form to edit an existing advertisement
 */
async function edit(req, res) {
    try {
        
    } catch (error) {
        console.error("Error fetching advertisement for editing:", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.ADVERTISEMENT,
            })
        ));
    }
}

/**
 * Update an existing advertisement by ID
 */
async function update(req, res) {
    const validationErrors = await editAdvertisementRequest(req);
    if (validationErrors) {
        return res.status(400).json(errorResponse(req.trans.messages.validation_error, validationErrors));
    }

    try {
        
    } catch (error) {
        console.error("Error updating advertisement:", error);
        console.error("Error fetching advertisement for editing:", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.ADVERTISEMENT,
            })
        ));
    }
} 


/**
 * Soft delete a advertisement by ID
 */
async function destroy(req, res) {
    try {
        const advertisement = await Advertisement.findById(req.params.id);
        
        if (!advertisement || advertisement.isDeleted) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                attribute : req.trans.cruds.MODULE.ADVERTISEMENT
                })
            ));
        }

        await advertisement.softDelete();
        
        advertisement.deletedBy = req.user._id;
        await advertisement.save();

        return res.status(200).json(
        successResponse(
            req.t(req.trans.messages.delete_success_message, {
                attribute : req.trans.cruds.MODULE.ADVERTISEMENT
            }), {
            advertisement,
        }, null, null, '/admin/advertisements'));
    } catch (error) {
        console.error("Error deleting advertisement: ", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute : req.trans.cruds.MODULE.ADVERTISEMENT
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
                        attribute : req.trans.cruds.ADVERTISEMENT.fields.status,
                    })
                )
            );
        }

        await Advertisement.findByIdAndUpdate(id, { status });
        return res.status(200).json(
            successResponse(
                req.t(req.trans.messages.key_update, {
                    attribute : req.trans.cruds.MODULE.ADVERTISEMENT,
                    status : status,
                }), {}, null, null, null
            )
        );
    } catch (error) {
        console.error('Error while updating advertisements status:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute : req.trans.cruds.MODULE.ADVERTISEMENT
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
