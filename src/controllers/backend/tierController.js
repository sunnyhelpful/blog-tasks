const User = require("../../models/user");
const Tier = require("../../models/tier");
const BoostedListingTier = require("../../models/boostedListingTier");
const { 
    prepareMongooseDataTablesParams 
} = require("../../utils/helper");
const tierTransformer = require('../../transformers/backend/tierTransformer');
const { 
    addTierRequest, 
    editTierRequest 
} = require('../../requests/backend/tierRequest');

const {
    successResponse,
    errorResponse,
    internalServerErrorResponse,
} = require('../../utils/apiResponses');

const constantKey = require('../../config/constant');

/**
 * Show a list of all tiers with pagination, sorting, and search
 */
async function index(req, res) {
    try {
        if (!req.xhr && !req.headers.accept.includes('json')) {
            return res.render('backend/tiers/index');
        }

        const { pageSize, pageStart, searchFilter, sortColumn, sortOrder } = prepareMongooseDataTablesParams(req, ['title', 'tierNumber', 'applicableFeePercent', 'status', 'createdAt'], Tier.schema);
        const finalSortColumn = sortColumn || 'createdAt';
        const finalSortOrder = sortOrder === 'ASC' ? 1 : -1;

        const totalCount = await Tier.countDocuments({ isDeleted: false });
        const filteredCount = await Tier.countDocuments({ isDeleted: false, ...searchFilter });

        const tiers = await Tier.find({ isDeleted: false, ...searchFilter })
            .skip(pageStart)
            .limit(pageSize)
            .sort({ [finalSortColumn]: finalSortOrder });

        const transformedTiers = tierTransformer.transformCollection(tiers, req.session.lang);

        return res.json({
            draw: parseInt(req.query.draw) || 1,
            recordsTotal: totalCount,
            recordsFiltered: filteredCount,
            data: transformedTiers,
        });

    } catch (error) {
        console.error('Error fetching tiers:', error);
        if (!req.xhr && !req.headers.accept.includes('json')) {
            return res.status(500).render('common/pages/page-500', {
                layout: 'layouts/pageLayout',
                errorDetails: error.message,
                redirectUrl: '/admin/tiers',
            });
        } else {
            return res.status(500).json(internalServerErrorResponse(
                req.t(req.trans.messages.oops_something_went_wrong, {
                    attribute: req.trans.cruds.MODULE.TIER,
                })
            ));
        }
    }
}

/**
 * Create a tier
 */
async function create(req, res) {
    try {
        return res.render("backend/tiers/create", {
            tier: {},
            TIER_NUMBERS: constantKey.TIER.TIER_NUMBERS,
        });
    } catch (error) {
        console.error('Error preparing tier creation:', error);
        req.flash("error_with_popup", req.t(
            req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.TIER, 
            })
        );
        return res.redirect('/admin/tiers');
    }
}

/**
 * Store a new tier
 */
async function store(req, res) {
    try {
        const validationErrors = await addTierRequest(req);
        if (validationErrors) {
            return res.status(400).json(errorResponse(req.trans.auth.validation_error, validationErrors));
        }

        const {
            title_en,
            title_ar,
            description_en,
            description_ar,
            tierNumber,
            maxPostedListings,
            listingDurationDays,
            annualSubscription,
            applicableFeePercent,
            maxFee,
            save_continue
        } = req.body;

        const title = {
            en: title_en,
            ar: title_ar
        };
    
        const description = {
            en: description_en,
            ar: description_ar
        };

        const store = await Tier.create({
            title,
            description,
            tierNumber,
            maxPostedListings,
            listingDurationDays,
            annualSubscription,
            applicableFeePercent,
            maxFee,
            createdBy: req.user.id
        });

        const url = save_continue == 1 ? '/admin/tier/create' : '/admin/tiers';
        return res.status(201).json(successResponse(
            req.t(req.trans.messages.add_success_message, {
                attribute : req.trans.cruds.TIER.title_singular
            }), { store,
        }, null, null, url));
    } catch (error) {
        console.error('Error creating tier:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.TIER,
            })
        ));
    }
}

/**
 * Show a specific tier
 */
async function show(req, res) {
    try {
        const { id } = req.params;
        const filter = { 
            _id: id, 
            isDeleted: false,
        };
        const tierDoc = await Tier.findOne(filter);
        if (!tierDoc) {
            req.flash("error_with_popup", req.t(
                req.trans.messages.not_found, {
                    attribute: req.trans.cruds.MODULE.TIER, 
                })
            );
            return res.redirect('/admin/tiers');
        }

        const tier = {
            ...tierDoc.toObject(),
            title: Object.fromEntries(tierDoc.title),
            description: Object.fromEntries(tierDoc.description),
        };
        return res.render('backend/tiers/show', {
            tier: tier,
            TIER_NUMBERS: constantKey.TIER.TIER_NUMBERS,
        });
    } catch (error) {
        console.error('Error fetching tier:', error);
        req.flash("error_with_popup", req.t(
            req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.TIER,
            })
        );
        return res.redirect('/admin/tiers');
    }
}

/**
 * Display form data for editing a tier
 */
async function edit(req, res) {
    try {
        const { id } = req.params;
        const filter = { 
            _id: id, 
            isDeleted: false,
        };
        const tierDoc = await Tier.findOne(filter);
        if (!tierDoc) {
            req.flash("error_with_popup", req.t(
                req.trans.messages.not_found, {
                    attribute: req.trans.cruds.MODULE.TIER, 
                })
            );
            return res.redirect('/admin/tiers');
        }

        const tier = {
            ...tierDoc.toObject(),
            title: Object.fromEntries(tierDoc.title),
            description: Object.fromEntries(tierDoc.description),
        };

        return res.render("backend/tiers/edit", {
            tier: tier,
            TIER_NUMBERS: constantKey.TIER.TIER_NUMBERS,
        });
    } catch (error) {
        req.flash("error_with_popup", req.t(
            req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.TIER, 
            })
        );
        return res.redirect('/admin/tiers');
    }
}

/**
 * Update a tier
 */
async function update(req, res) {
    try {
        const validationErrors = await editTierRequest(req);
        if (validationErrors) {
            return res.status(400).json(errorResponse(req.trans.auth.validation_error, validationErrors));
        }

        const {
            title_en,
            title_ar,
            description_en,
            description_ar,
            tierNumber,
            maxPostedListings,
            listingDurationDays,
            annualSubscription,
            applicableFeePercent,
            maxFee,
            save_continue
        } = req.body;

        const title = {
            en: title_en,
            ar: title_ar
        };
    
        const description = {
            en: description_en,
            ar: description_ar
        };

        const update = {
            title,
            description,
            tierNumber,
            maxPostedListings,
            listingDurationDays,
            annualSubscription,
            applicableFeePercent,
            maxFee,
            updatedBy: req.user._id
        };

        const tierUpdate = await Tier.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!tierUpdate && tierUpdate.isDeleted) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute : req.trans.cruds.MODULE.TIER
                })
            ));
        }

        const url = req.body.update_continue == 1 ? `/admin/tier/${req.params.id}/edit` : '/admin/tiers';
        return res.status(201).json(successResponse(
            req.t(req.trans.messages.update_success_message, {
                attribute : req.trans.cruds.TIER.title_singular
            }), { tierUpdate,
        }, null, null, url));
    } catch (error) {
        console.error('Error updating tier:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.TIER,
            })
        ));
    }
}

/**
 * Soft delete a tier
 */
async function destroy(req, res) {
    try {
        const { id } = req.params;
        const filter = { 
            _id: id, 
            isDeleted: false
        };

        const tier = await Tier.findOne(filter);
        if (!tier) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute : req.trans.cruds.MODULE.TIER
                })
            ));
        }

        await tier.softDelete(req.user._id);
        return res.json(successResponse(
            req.t(req.trans.messages.delete_success_message, {
                attribute : req.trans.cruds.TIER.title_singular
        }), { id }));
    } catch (error) {
            console.error('Error deleting tier:', error);
            return res.status(500).json(internalServerErrorResponse(
                req.t(req.trans.messages.oops_something_went_wrong, {
                    attribute: req.trans.cruds.MODULE.TIER,
                })
            ));
    }
}

/* Tier Status */
async function statusUpdate(req, res) {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.invalid_key, {
                    attribute: req.trans.cruds.TIER.fields.status,
                })
            ));
        }

        const tier = await Tier.findByIdAndUpdate(id, { status }, { new: true });
        if (!tier) {
            return res.status(404).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute: req.trans.cruds.TIER.fields.status,
                })
            ));
        }

        return res.status(200).json(successResponse(
            req.t(req.trans.messages.key_update, {
                attribute: req.trans.cruds.MODULE.TIER,
                status: status,
            }), { tier 
        }, null, null, null));
    } catch (error) {
        console.error('Error while updating tier status:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.TIER
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
};