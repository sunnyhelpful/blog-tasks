const mongoose = require('mongoose');
const Announcement = require('../../models/announcement');
const { 
    preparePaginationParams,
    buildSearchFilterMongoose
} = require("../../utils/helper");

const announcementTransformer = require('../../transformers/api/announcementTransformer');
const {
    successResponse,
    errorResponse,
    internalServerErrorResponse,
} = require('../../utils/apiResponses');

/**
 * Show a list of all Announcement Type
 */
async function index(req, res) {
    try {
        const searchableFields = ['title'];

        const paginationParams = await preparePaginationParams(req);
        if (!paginationParams) {
            return res.status(400).json(errorResponse(req.trans.messages.invalid_pagination_parameters));
        }

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        
        const filter = {
            status: 'active',
            isDeleted: false,
            end_date: { $gte: today }
        };

        const searchFilter = buildSearchFilterMongoose(req.query, searchableFields, Announcement.schema);
        if (searchFilter.$or && searchFilter.$or.length) {
            filter.$and = [searchFilter];
        }

        const [announcements, total] = await Promise.all([
            Announcement.find(filter).sort(paginationParams.sort).skip(paginationParams.skip).limit(paginationParams.limit).lean(),
            Announcement.countDocuments(filter)
        ]);
        // logInfo(announcements);
        const data = announcementTransformer.transformCollection(announcements, req.session.lang);
        
        return res.json(successResponse(
            req.t(req.trans.messages.add_success_message, {
                attribute : req.trans.cruds.MODULE.ANNOUNCEMENT
            }), { data, 
                pagination: {
                    total,
                    page: paginationParams.page,
                    limit: paginationParams.limit,
                    totalPages: Math.ceil(total / paginationParams.limit),
                }
            }, null, null, null)
        );
    } catch (error) {
        console.error('Announcement List Error:', error);
        return res.status(500).json(internalServerErrorResponse('Failed to retrieve Announcement'));
    }
}


  
/**
 * Create a brand
 */
async function create(req, res) {
    try {
        
    } catch (error) {
        console.error('Error preparing brand creation:', error);
        return res.status(500).json(internalServerErrorResponse('Failed to prepare brand creation'));
    }
}


/**
 * Store a new brand
 */
async function store(req, res) {
    try {
        
    } catch (error) {
        console.error('Error creating brand type:', error);
        return res.status(500).json(internalServerErrorResponse('Failed to create brand type'));
    }
}


/**
 * Show a specific brand (by ID or slug) with pagination and search
 */
async function show(req, res) {
    try {
        const searchableFields = ['title'];

        const paginationParams = await preparePaginationParams(req);
        if (!paginationParams) {
            return res.status(400).json(errorResponse(req.trans.messages.invalid_pagination_parameters));
        }

        const idOrSlug = req.params.id_or_slug;
        const isValidObjectId = mongoose.Types.ObjectId.isValid(idOrSlug);

        const identifierCondition = isValidObjectId
            ? { _id: idOrSlug }
            : { slug: idOrSlug };

        const filter = {
            status: 'active',
            isDeleted: false,
            ...identifierCondition
        };

        const searchFilter = buildSearchFilterMongoose(req.query, searchableFields, Announcement.schema);
        if (searchFilter.$or && searchFilter.$or.length) {
            filter.$and = [searchFilter];
        }

        const [categoryTypeList, total] = await Promise.all([
            Announcement.find(filter)
                .sort(paginationParams.sort)
                .skip(paginationParams.skip)
                .limit(paginationParams.limit)
                .lean(),
            Announcement.countDocuments(filter)
        ]);

        const data = brandTransformer.transformCollection(categoryTypeList, req.session.lang);

        return res.json(successResponse(
            req.t(req.trans.messages.add_success_message, {
                attribute: req.trans.cruds.MODULE.CATEGORY_TYPE
            }), { data, 
                pagination: {
                    total,
                    page: paginationParams.page,
                    limit: paginationParams.limit,
                    totalPages: Math.ceil(total / paginationParams.limit),
                }
            }, null, null, null
        ));
    } catch (error) {
        console.error('Error fetching brand type:', error);
        return res.status(500).json(internalServerErrorResponse('Failed to retrieve brand type'));
    }
}


  
  
/**
* Display form data for editing a brand (not typically needed for API, but included)
*/
async function edit(req, res) {
  try {
    
  } catch (error) {
    console.error('Error preparing brand edit:', error);
    return res.status(500).json(internalServerErrorResponse('Failed to prepare brand edit'));
  }
}


/**
* Update a brand
*/
async function update(req, res) {
  try {
    
  } catch (error) {
    console.error('Error updating brand:', error);
    return res.status(500).json(internalServerErrorResponse('Failed to update brand'));
  }
}


/**
* Soft delete a brand
*/
async function destroy(req, res) {
  try {
    
  } catch (error) {
    console.error('Error deleting brand:', error);
    return res.status(500).json(internalServerErrorResponse('Failed to delete brand'));
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
};