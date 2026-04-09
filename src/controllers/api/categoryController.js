const Category = require('../../models/category');
const { 
    preparePaginationParams,
    buildSearchFilterMongoose
} = require("../../utils/helper");
const formatIdentifier = require('../../utils/identifierFormat');
const categoryTransformer = require('../../transformers/api/categoryTransformer');
const {
    successResponse,
    errorResponse,
    internalServerErrorResponse,
} = require('../../utils/apiResponses');

/**
 * Show a list of all categories
 */
async function index(req, res) {
  try {
    /* const searchableFields = ['title'];

    const paginationParams = await preparePaginationParams(req);
    if (!paginationParams) {
      return res.status(400).json(errorResponse(req.trans.messages.invalid_pagination_parameters));
    }

    const filter = {
      category_type: 'category',
      status: 'active',
      isDeleted: false,
    };

    const searchFilter = buildSearchFilterMongoose(req.query, searchableFields, Category.schema);
    if (searchFilter.$or && searchFilter.$or.length) {
      filter.$and = [searchFilter];
    }

    const [categories, total] = await Promise.all([
      Category.find(filter).sort(paginationParams.sort).skip(paginationParams.skip).limit(paginationParams.limit).lean(),
      Category.countDocuments(filter)
    ]);

    const data = categoryTransformer.transformCollection(categories, req.session.lang);
    
    return res.json(successResponse(
      req.t(req.trans.messages.add_success_message, {
        attribute : req.trans.cruds.MODULE.CATEGORY
      }), { data, 
        pagination: {
          total,
          page: paginationParams.page,
          limit: paginationParams.limit,
          totalPages: Math.ceil(total / paginationParams.limit),
        }
      }, null, null, null)
    ); */
    const searchableFields = ['title', 'slug', 'category_type'];
    const {
      length = 10,
      start = 0,
      search = '',
      sortColumn = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;

    const sortDirection = sortOrder === 'ASC' ? 1 : -1;
    const paginationParams = await preparePaginationParams(req);
    if (!paginationParams) {
      return res.status(400).json(errorResponse(req.trans.messages.invalid_pagination_parameters));
    }

    const filter = {
      category_type: 'category_type',
      status: 'active',
      isDeleted: false,
    };

    const keyword = search.trim();
    const searchFilter = keyword
      ? { [`title.${req.session.lang}`]: { $regex: keyword, $options: 'i' }, isDeleted: false }
      : { isDeleted: false };

    const matchedCategories = await Category.find(searchFilter).lean();

    const categoryIds = new Set();
    for (const cat of matchedCategories) {
      categoryIds.add(String(cat._id));
      let current = cat;
      while (current.parentId) {
        categoryIds.add(String(current.parentId));
        const parent = await Category.findById(current.parentId).lean();
        if (!parent) break;
        current = parent;
      }
    }

    const allCategories = await Category.find({
      $or: [
        { _id: { $in: Array.from(categoryIds) } },
        { isDeleted: false }
      ]
    }).lean();

    const parentFilter = {
      isDeleted: false,
      category_type: 'category_type',
      ...(keyword ? { _id: { $in: Array.from(categoryIds) } } : {})
    };

    const totalCount = await Category.countDocuments({ isDeleted: false, category_type: 'category_type' });
    const filteredCount = keyword
      ? await Category.countDocuments(parentFilter)
      : totalCount;

    const parentCategories = await Category.find(parentFilter)
      .sort({ [sortColumn]: sortDirection })
      .skip(paginationParams.start)
      .limit(paginationParams.size)
      .lean();

    const parentIds = parentCategories.map(cat => String(cat._id));
    const categoryMap = new Map(allCategories.map(cat => [String(cat._id), cat]));

    const childrenMap = {};
    for (const cat of allCategories) {
      const pid = cat.parentId ? String(cat.parentId) : null;
      if (!childrenMap[pid]) childrenMap[pid] = [];
      childrenMap[pid].push(cat);
    }

    const buildTree = (node) => {
      const children = childrenMap[String(node._id)] || [];
      return {
        ...categoryTransformer.transform(node, req.session.lang),
        children: children.map(buildTree),
      };
    };

    const data = parentCategories.map(buildTree);

    return res.json(successResponse(
      req.t(req.trans.messages.add_success_message, {
        attribute: req.trans.cruds.MODULE.CATEGORY
      }), {
        data,
        pagination: {
          total: totalCount,
          page: paginationParams.page,
          limit: paginationParams.limit,
          totalPages: Math.ceil(totalCount / paginationParams.limit),
          filtered: filteredCount
        }
      }, null, null, null)
    );
  } catch (error) {
    console.error('Parent Categories List Error:', error);
    return res.status(500).json(internalServerErrorResponse('Failed to retrieve parent categories'));
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
    console.error('Error creating category:', error);
    return res.status(500).json(internalServerErrorResponse('Failed to create category'));
  }
}
  
  
/**
 * Show a specific category
 */
async function show(req, res) {
  try {
    const lang = req.session.lang;
    const idOrSlug = req.params.id_or_slug;
    const identifierCondition = formatIdentifier(idOrSlug);

    const filter = {
      ...identifierCondition,
      isDeleted: false,
    };

    const categoryDoc = await Category.findOne(filter).populate('parentId');
    if (!categoryDoc) {
      return res.status(400).json(errorResponse(
        req.t(req.trans.messages.not_found, {
          attribute: req.trans.cruds.MODULE.CATEGORY,
        })
      ));
    }

    const category = {
      _id: categoryDoc._id,
      title: categoryDoc.title.get(lang) || '',
      description: categoryDoc.description.get(lang) || '',
      slug: categoryDoc.slug,
      category_type: categoryDoc.category_type,
      parentId: categoryDoc.parentId ? {
        _id: categoryDoc.parentId._id,
        title: categoryDoc.parentId.title?.get(lang) || '',
        description: categoryDoc.parentId.description?.get(lang) || '',
        slug: categoryDoc.parentId.slug,
      } : null
    };

    const childrenRaw = await categoryDoc.getChildHierarchy();

    const localizeNode = (node) => ({
      _id: node._id,
      title: node.title?.[lang] || '',
      slug: node.slug,
      parentId: node.parentId,
      description: node.description?.[lang] || '',
      depth: node.depth,
      children: node.children ? node.children.map(localizeNode) : [],
    });

    const children = childrenRaw.map(localizeNode);

    return res.json(successResponse(
      req.t(req.trans.messages.fetch_success_message, {
        attribute : req.trans.cruds.MODULE.CATEGORY
      }), { 
        category, 
        children,
        pagination: {
          total,
          page: paginationParams.page,
          limit: paginationParams.limit,
          totalPages: Math.ceil(total / paginationParams.limit),
        }
      }, null, null, null)
    );
  } catch (error) {
    logInfo(error.stack);
    console.error('Error fetching category:', error);
    return res.status(500).json(internalServerErrorResponse('Failed to retrieve category'));
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