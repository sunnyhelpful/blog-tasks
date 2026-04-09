const Category = require("../../models/category");
const CategoryType = require("../../models/categoriesType");
const Upload = require("../../models/upload");
const { prepareMongooseDataTablesParams } = require("../../utils/helper");
const categoryTransformer = require('../../transformers/backend/categoryTransformer');
const { 
  addCategoryRequest, 
  editCategoryRequest 
} = require('../../requests/backend/categoryRequest');
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
 * Show a list of all roles with pagination, sorting, and search
 */
/* async function index(req, res) {
  try {
    if (!req.xhr && !req.headers.accept.includes('json')) {
      return res.render('backend/categories/index');
    }
    logInfo('query..', req.query);

    // const { pageSize, pageStart, searchFilter, sortColumn, sortOrder } = prepareMongooseDataTablesParams(req, ['title', 'createdAt'], Category.schema);
    const { pageSize, pageStart, searchFilter, sortColumn, sortOrder } = req.query;
    
    const finalSortColumn = sortColumn || 'createdAt';
    const finalSortOrder = sortOrder === 'ASC' ? 1 : -1;
 
    const totalCount = await Category.countDocuments({ isDeleted: false });
    const filteredCount = await Category.countDocuments({ isDeleted: false, ...searchFilter });
 
    // logInfo(await Category.find({ isDeleted: false, ...searchFilter })).sort({ [finalSortColumn]: finalSortOrder });
    // const categories = await Category.find({ isDeleted: false, ...searchFilter })
    //   .skip(pageStart)
    //   .limit(pageSize)
    //   .sort({ [finalSortColumn]: finalSortOrder });

    const categories = await Category.find({ isDeleted: false});

    const transformedCategories = categoryTransformer.transformCollection(categories, req.session.lang);
    if(transformedCategories.length > 10){
      pageSize = 10;
    } 
    return res.json({
      draw: parseInt(req.query.draw) || 1,
      recordsTotal: totalCount,
      recordsFiltered: filteredCount,
      data: transformedCategories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute : req.trans.cruds.MODULE.CATEGORY
      })
    ));
  }
} */

async function index(req, res) {
  try {
    if (!req.xhr && !req.headers.accept.includes('json')) {
      return res.render('backend/categories/index', {
        category: {},
        categories: {}
      });
    }

    const {
      length = 10,
      start = 0,
      search = '',
      sortColumn = 'createdAt',
      sortOrder = 'DESC',
    } = req.query;

    const pageSize = parseInt(length);
    const pageStart = parseInt(start);
    const sortDirection = sortOrder === 'ASC' ? 1 : -1;

    const searchFilter = {};
    if (search) {
      searchFilter[`title.${req.session.lang}`] = { $regex: search, $options: 'i' };
    }

    const parentFilter = { isDeleted: false, category_type: 'category', ...searchFilter };

    const totalCount = await Category.countDocuments({ isDeleted: false, category_type: 'category' });
    const filteredCount = await Category.countDocuments(parentFilter);

    const parentCategories = await Category.find(parentFilter)
      .sort({ [sortColumn]: sortDirection })
      .skip(pageStart)
      .limit(pageSize)
      .lean();

    const parentIds = parentCategories.map(cat => String(cat._id));
    const allCategories = await Category.find({ 
      isDeleted: false, 
      category_type: { $ne: 'category_type' } 
    }).lean();  
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

    const transformed = parentCategories.map(buildTree);

    return res.json({
      draw: parseInt(req.query.draw) || 1,
      recordsTotal: totalCount,
      recordsFiltered: filteredCount,
      data: transformed,
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.CATEGORY
      })
    ));
  }
}

/**
 * Create a role
 */
async function create(req, res) {
  try {
    const filter = {
      isDeleted: false,
      deletedAt: null,
      category_type: { $ne: 'category_type' }
    };
    const categoriesRaw = await Category.find(filter);

    const categories = categoriesRaw.map((cat) => ({
      ...cat.toObject(),
      title: Object.fromEntries(cat.title),
      description: Object.fromEntries(cat.description),
    }));
    return res.render("backend/categories/create", {
      category: {},
      categories: categories,
    });
  } catch (error) {
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute : req.trans.cruds.MODULE.CATEGORY
      })
    ));
  }
}
/**
 * Store a new category in the database
 */
async function store(req, res) {
  const validationErrors = await addCategoryRequest(req);
  if (validationErrors) {
    return res.status(400).json(errorResponse(req.trans.messages.validation_error, validationErrors));
  }
  try{
    const {
      category_en,
      category_ar,
      description_en,
      description_ar,
      parent_category,
      category_type,
      attribute,
    } = req.body;

    const title = {
      en: category_en,
      ar: category_ar
    };

    const description = {
      en: decodeURIComponent(description_en || ''),
      ar: decodeURIComponent(description_ar || '')
    };


    let parentId = parent_category || category_type;
    const categoryData = new Category({
      title,
      description,
      parentId: parentId || null,
      createdBy: req.user._id,
      attributeId: attribute,
      category_type: parent_category ? 'sub_categories' : 'category',
      isVerification: "approved",
    });
    const storeCategory = await Category.create(categoryData);

    let fileMetadata = null;
    if (req.files) {
      const isS3 = !!process.env.AWS_SDK_API_KEY && !!process.env.AWS_SDK_API_SECRET_KEY;
      if (req.files?.category_image?.[0]) {
        fileMetadata = await saveUpload(storeCategory._id, 'Category', req.files?.category_image?.[0], 'category_image', isS3);
      }
      if (req.files?.category_icon?.[0]) {
        fileMetadata = await saveUpload(storeCategory._id, 'Category', req.files?.category_icon?.[0], 'category_icon', isS3);
      }
    }
    
    return res.status(201).json(
      successResponse(
        req.t(req.trans.messages.add_success_message, {
          attribute : req.trans.cruds.MODULE.CATEGORY
        }), {
          storeCategory,
    }, null, null, '/admin/categories'));
  } catch(error){
    logInfo('Error creating category:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute : req.trans.cruds.MODULE.CATEGORY
      })
    ));
  }
}

/**
 * Show a single category by ID
 */
async function show(req, res) {
  try {
    const categoryDoc = await Category.findById(req.params.id)
      .populate("parentId")
      .populate("category_image")
      .populate("category_icon");

    if (!categoryDoc || categoryDoc.isDeleted) {
      req.flash("error_with_popup", req.t(
        req.trans.messages.oops_something_went_wrong, {
          attribute: req.trans.cruds.MODULE.CATEGORY,
        })
      );
      return res.redirect('/admin/categories');
    }

    const categoryObject = categoryDoc.toObject();

    const category = {
      ...categoryObject,
      title: Object.fromEntries(categoryDoc.title),
      description: Object.fromEntries(categoryDoc.description),
    };

    if (category.parentId && categoryDoc.parentId?.title instanceof Map) {
      category.parentId.title = Object.fromEntries(categoryDoc.parentId.title);
    }
    if (category.parentId && categoryDoc.parentId?.description instanceof Map) {
      category.parentId.description = Object.fromEntries(categoryDoc.parentId.description);
    }

    const parentHierarchy = await categoryDoc.getHierarchy();
    const childHierarchy = await categoryDoc.getChildHierarchy();

    let hierarchy = [];
    if (category.parentId) {
      // hierarchy = parentHierarchy;
      hierarchy = parentHierarchy[0]?.children || [];
    } else {
      hierarchy = childHierarchy;
    }

    return res.render("backend/categories/show", {
      category,
      hierarchy,
    });
  } catch (error) {
    console.error("Error fetching category: ", error);
    req.flash("error_with_popup", req.t(
      req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.CATEGORY,
      })
    );
    return res.redirect('/admin/categories');
  }
}



/**
 * Render a form to edit an existing category
 */
async function edit(req, res) {
  try {
    const filter = {
      isDeleted: false,
      deletedAt: null,
      category_type: { $ne: 'category_type' }
    };
    const categoriesRaw = await Category.find(filter);

    const categories = categoriesRaw.map((cat) => ({
      ...cat.toObject(),
      title: Object.fromEntries(cat.title),
      description: Object.fromEntries(cat.description),
    }));

    const categoryDoc = await Category.findOne({
      _id: req.params.id,
      isDeleted: false,
      deletedAt: null,
      category_type: { $ne: 'category_type' }
    }).populate(['category_image', 'category_icon']).populate('attributeId');

    if (!categoryDoc) {
      return res.status(404).json(
        errorResponse(
          req.t(req.trans.messages.not_found, {
            attribute : req.trans.cruds.MODULE.CATEGORY,
          })
        )
      );
    }

    let categoryType = null;
    if (categoryDoc.parentId) {
      categoryType = await Category.findOne({
        _id: categoryDoc.parentId,
        isDeleted: false,
        deletedAt: null,
        category_type: 'category_type'
      });
    }

    let categoryTypeTitle = {};
    let categoryTypeDescription = {};
    if (categoryType) {
      categoryTypeTitle = Object.fromEntries(categoryType.title);
      categoryTypeDescription = Object.fromEntries(categoryType.description);
    }

    const category = {
      ...categoryDoc.toObject(),
      title: Object.fromEntries(categoryDoc.title),
      description: Object.fromEntries(categoryDoc.description),
      attributeId: categoryDoc.attributeId.map(attr => ({
        id: attr._id,
        title: attr.title?.get(req.session.lang) || attr.title?.get('en') || ''
      })),
      category_type_info: categoryType
        ? {
            _id: categoryType._id,
            title: categoryTypeTitle[req.session.lang] || categoryTypeTitle['en'],
            description: categoryTypeDescription,
          }
        : null,
    };

    if (!req.xhr && !req.headers.accept.includes('json')) {
      return res.render("backend/categories/edit", {
        category,
        categories,
      });
    }
    const data = {
      category: category,
      categories: {},
    }
    return res.status(200).json(successResponse(
      req.t(req.trans.messages.fetch_success_message, {
        attribute: req.trans.cruds.MODULE.CATEGORY
      }), { data },
    ), null, null);
  } catch (error) {
    console.error("Error fetching category for editing: ", error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.CATEGORY
      })
    ));
  }
}

/**
 * Update an existing category by ID
 */
async function update(req, res) {
  const validationErrors = await editCategoryRequest(req);
  if (validationErrors) {
    return res.status(400).json(errorResponse(req.trans.messages.validation_error, validationErrors));
  }
  try {
    const {
      category_en,
      category_ar,
      description_en,
      description_ar,
      parent_category,
      category_type,
      attribute,
    } = req.body;

    const title = {
      en: category_en,
      ar: category_ar,
    };

    const description = {
      en: decodeURIComponent(description_en || ''),
      ar: decodeURIComponent(description_ar || '')
    };

    const filter = {
      _id: req.params.id,
      isDeleted:false,
      category_type: { $ne: 'category_type' }
    };

    const categoryCheck = await Category.findOne(filter);
    let parentId = categoryCheck.category_type === 'category' ? category_type : parent_category;
    const updateData = {
      title,
      description,
      parentId: parentId || null,
      attributeId: attribute,
      updatedBy: req.user._id,
    };

    const updatedCategory = await Category.findOneAndUpdate(filter, updateData, { new: true });    

    let fileMetadata = null;
    if (req.files) {
      const isS3 = !!process.env.AWS_SDK_API_KEY && !!process.env.AWS_SDK_API_SECRET_KEY;
      if (req.files?.category_image?.[0]) {
        fileMetadata = await saveUpload(updatedCategory._id, 'Category', req.files?.category_image?.[0], 'category_image', isS3);
      }
      if (req.files?.category_icon?.[0]) {
        fileMetadata = await saveUpload(updatedCategory._id, 'Category', req.files?.category_icon?.[0], 'category_icon', isS3);
      }
    }

    return res.status(200).json(successResponse(
        req.t(req.trans.messages.update_success_message, {
          attribute: req.trans.cruds.MODULE.CATEGORY
        }), { updatedCategory 
      }, null, null, '/admin/categories')
    );
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.CATEGORY
      })
    ));
  }
}


/**
 * Soft delete a category by ID
 */
async function destroy(req, res) {
  try {
    const filter = {
      _id: req.params.id,
      isDeleted: false,
      category_type: { $ne: 'category_type' }
    };
    const category = await Category.findOne(filter);
    
    if (!category || category.isDeleted) {
      return res.status(400).json(errorResponse(
        req.t(req.trans.messages.not_found, {
          attribute: req.trans.cruds.MODULE.CATEGORY
        })
      ));
    }

    const childCategories = await Category.find({ parentId: req.params.id, isDeleted: false, category_type: { $ne: 'category_type' } });
    
    if (childCategories.length > 0) {
      for (let child of childCategories) {
        const grandChildCategories = await Category.find({ parentId: child.id, isDeleted: false, category_type: { $ne: 'category_type' } });
        
        if (grandChildCategories.length > 0) {
          for (let grandChild of grandChildCategories) {
            await grandChild.softDelete(req.user._id);
          }
        }
        
        await child.softDelete(req.user._id);
      }
    }

    await category.softDelete(req.user._id);

    return res.status(200).json(
      successResponse(
        req.t(req.trans.messages.delete_success_message, {
          attribute: req.trans.cruds.MODULE.CATEGORY
        }), {
          category,
        }, null, null, '/admin/categories'
      )
    );

  } catch (error) {
    console.error("Error deleting category: ", error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.CATEGORY
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
            attribute : req.trans.cruds.CATEGORY.fields.status,
          })
        )
      );
    }

    await Category.findByIdAndUpdate(id, { status });
    return res.status(200).json(
      successResponse(
        req.t(req.trans.messages.key_update, {
          attribute : req.trans.cruds.MODULE.CATEGORY,
          status : status,
        }), {
    }, null, null, null));
  } catch (error) {
    console.error('Error while updating category status:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute : req.trans.cruds.MODULE.CATEGORY
      })
    ));
  }
}

async function verificationUpdate(req, res) {
  try {
    const { isVerification } = req.body;
    const { id } = req.params;

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(isVerification)) {
      return res.status(400).json(
        errorResponse(
          req.t(req.trans.messages.invalid_key, {
            attribute : req.trans.cruds.CATEGORY.fields.verification,
          })
        )
      );
    }

    
    await Category.findByIdAndUpdate(id, { isVerification });
    return res.status(200).json(
      successResponse(
        req.t(req.trans.messages.key_update, {
          attribute : req.trans.cruds.MODULE.CATEGORY,
          status : isVerification,
        }), {
    }, null, null, null));
  } catch (error) {
    console.error('Error while updating category status:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute : req.trans.cruds.MODULE.CATEGORY
      })
    ));
  }
}

/*
** Import Categories 
*/
async function categoryImport(req, res) {
  try {
    if (!req.excelData) {
      return res.status(400).json(
        errorResponse(
          req.t(req.trans.messages.not_found, {
            attribute : req.trans.cruds.MODULE.CATEGORY,
          })
        )
      );
    }

    const data = req.excelData;
    const userId = req.user._id;
    const requiredHeaders = [
      'Category Type (English)',
      'Category Type (Arabic)',
      'Parent Category (English)',
      'Parent Category (Arabic)',
      'Child Category (English)',
      'Child Category (Arabic)',
      'Description (English)',
      'Description (Arabic)',
    ];

    const header = data[0];
    const missingHeaders = requiredHeaders.filter(
      (headerName) => !header.includes(headerName)
    );

    if (missingHeaders.length > 0) {
      return res.status(400).json(
        errorResponse(req.trans.messages.missing_field_requireds + ' ' + missingHeaders.join(', '))
      );
    }
    
    let insertCount = 0;
    for (let index = 1; index < data.length; index++) {
      const row = data[index];

      const [
        , // S. No.
        category_type_en,
        category_type_ar,
        parent_en,
        parent_ar,
        child_en,
        child_ar,
        description_en,
        description_ar,
      ] = row.map((v) => (typeof v === 'string' ? v.trim() : v));

      if (!parent_en || !parent_ar) continue;

      let getCategoryType = await CategoryType.findOne({
        isDeleted: false,
        category_type: 'category_type',
        $or: [
          { 'title.en': new RegExp('^' + category_type_en + '$', 'i') },
          { 'title.ar': new RegExp('^' + category_type_ar + '$', 'i') },
        ],
      });

      if(!getCategoryType){
        getCategoryType = new Category({
          title: { 
            en: category_type_en, 
            ar: category_type_en 
          },
          description: { 
            en: '', 
            ar: '' 
          },
          createdBy: userId,
          category_type: 'category_type',
          isVerification: "approved",
        });
        await getCategoryType.save();
        insertCount++;
      }

      let parentCategory = await Category.findOne({
        isDeleted: false,
        category_type: 'category',
        $or: [
          { 'title.en': new RegExp('^' + parent_en + '$', 'i') },
          { 'title.ar': new RegExp('^' + parent_ar + '$', 'i') },
        ],
      });

      if (!parentCategory) {
        parentCategory = new Category({
          title: { 
            en: parent_en, 
            ar: parent_ar 
          },
          description: { 
            en: description_en || '', 
            ar: description_ar || '' 
          },
          parentId: getCategoryType._id,
          createdBy: userId,
          category_type: 'category',
          isVerification: "approved",
        });
        await parentCategory.save();
        insertCount++;
      }

      if (!child_en || !child_ar) continue;

      const existingChild = await Category.findOne({
        isDeleted: false,
        category_type: 'sub_categories',
        $or: [
          { 'title.en': new RegExp('^' + child_en + '$', 'i') },
          { 'title.ar': new RegExp('^' + child_ar + '$', 'i') },
        ],
      });

      if (!existingChild) {
        const newChildCategory = new Category({
          title: { en: child_en, ar: child_ar },
          description: {
            en: description_en || '',
            ar: description_ar || '',
          },
          parentId: parentCategory._id,
          category_type: 'sub_categories',
          isVerification: "approved",
          createdBy: userId,
        });
        await newChildCategory.save();
        insertCount++;
      }
    }

    if(insertCount > 0){
      return res.status(200).json(successResponse(
        req.t(req.trans.messages.import_success_message, {
          count : insertCount,
          attribute : req.trans.cruds.MODULE.CATEGORY,
        }), { insertCount 
      }, null, null, null));
    } else {
      return res.status(200).json(errorResponse(
        req.t(req.trans.messages.import_success_message, {
          count : insertCount,
          attribute : req.trans.cruds.MODULE.CATEGORY,
        })
      ));
    }
  } catch (error) {
    console.error('Import Error:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute : req.trans.cruds.MODULE.CATEGORY
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
  categoryImport
};