const mongoose = require('mongoose');
const CategoryType = require('../../models/categoriesType');
const { 
    preparePaginationParams,
    buildSearchFilterMongoose
} = require("../../utils/helper");

const categoryTypeTransformer = require('../../transformers/api/categoryTypeTransformer');
const {
    successResponse,
    errorResponse,
    internalServerErrorResponse,
} = require('../../utils/apiResponses');

/**
 * Show a list of all Categories Type
 */
async function index(req, res) {
    try {
        const searchableFields = ['title'];

        const paginationParams = await preparePaginationParams(req);
        if (!paginationParams) {
        return res.status(400).json(errorResponse(req.trans.messages.invalid_pagination_parameters));
        }

        const filter = {
            status: 'active',
            isDeleted: false,
            category_type: 'category_type',
        };

        const searchFilter = buildSearchFilterMongoose(req.query, searchableFields, CategoryType.schema);
        if (searchFilter.$or && searchFilter.$or.length) {
            filter.$and = [searchFilter];
        }

        const [categories_type, total] = await Promise.all([
            CategoryType.find(filter).sort(paginationParams.sort).skip(paginationParams.skip).limit(paginationParams.limit).lean().populate('category_type_image').populate('category_type_icon'),
            CategoryType.countDocuments(filter)
        ]);

        const data = categoryTypeTransformer.transformCollection(categories_type, req.session.lang);
        
        return res.json(successResponse(
            req.t(req.trans.messages.add_success_message, {
                attribute : req.trans.cruds.MODULE.CATEGORY_TYPE
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
        console.error('Parent Categories Type List Error:', error);
        return res.status(500).json(internalServerErrorResponse('Failed to retrieve parent Categories Type'));
    }
}


  
/**
 * Create a category
 */
async function create(req, res) {
    try {
        
    } catch (error) {
        console.error('Error preparing category creation:', error);
        return res.status(500).json(internalServerErrorResponse('Failed to prepare category creation'));
    }
}


/**
 * Store a new category
 */
async function store(req, res) {
    try {
        
    } catch (error) {
        console.error('Error creating category type:', error);
        return res.status(500).json(internalServerErrorResponse('Failed to create category type'));
    }
}


/**
 * Show a specific category (by ID or slug) with pagination and search
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
            category_type: 'category_type',
            ...identifierCondition
        };

        const searchFilter = buildSearchFilterMongoose(req.query, searchableFields, CategoryType.schema);
        if (searchFilter.$or && searchFilter.$or.length) {
            filter.$and = [searchFilter];
        }

        const [categoryTypeList, total] = await Promise.all([
            CategoryType.find(filter)
                .sort(paginationParams.sort)
                .skip(paginationParams.skip)
                .limit(paginationParams.limit)
                .lean(),
            CategoryType.countDocuments(filter)
        ]);

        const dataWithChildren = await Promise.all(
            categoryTypeList.map(async (category) => {
                const categoryInstance = await CategoryType.findById(category._id);
                const children = await categoryInstance.getChildHierarchy();
        
                return {
                    ...category,
                    children
                };
            })
        );

        const data = categoryTypeTransformer.transformCollection(dataWithChildren, req.session.lang);

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
        console.error('Error fetching category type:', error);
        return res.status(500).json(internalServerErrorResponse('Failed to retrieve category type'));
    }
}


  
  
/**
* Display form data for editing a category (not typically needed for API, but included)
*/
async function edit(req, res) {
  try {
    
  } catch (error) {
    console.error('Error preparing category edit:', error);
    return res.status(500).json(internalServerErrorResponse('Failed to prepare category edit'));
  }
}


/**
* Update a category
*/
async function update(req, res) {
  try {
    
  } catch (error) {
    console.error('Error updating category:', error);
    return res.status(500).json(internalServerErrorResponse('Failed to update category'));
  }
}


/**
* Soft delete a category
*/
async function destroy(req, res) {
  try {
    
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json(internalServerErrorResponse('Failed to delete category'));
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