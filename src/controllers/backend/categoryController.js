const Category = require("../../models/category");
const Attribute = require("../../models/attribute");
const CategoryType = require("../../models/categoriesType");
const CategoryAttribute = require("../../models/categoryAttribute");
const Upload = require("../../models/upload");
const { prepareMongooseDataTablesParams, checkFileExists } = require("../../utils/helper");
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
const constant = require('../../config/constant');

/**
 * Show a list of all roles with pagination, sorting, and search
 */
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

    const searchFilter = search
      ? { [`title.${req.session.lang}`]: { $regex: search, $options: 'i' }, isDeleted: false }
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
      ...(search ? { _id: { $in: Array.from(categoryIds) } } : {})
    };

    const totalCount = await Category.countDocuments({ isDeleted: false, category_type: 'category_type' });
    const filteredCount = search
      ? await Category.countDocuments({ ...searchFilter })
      : totalCount;

    const parentCategories = await Category.find(parentFilter)
      .sort({ [sortColumn]: sortDirection })
      .skip(pageStart)
      .limit(pageSize)
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

    const transformed = parentCategories.map(buildTree);

    return res.json({
      draw: parseInt(req.query.draw) || 1,
      recordsTotal: totalCount,
      recordsFiltered: filteredCount,
      data: transformed,
      matchedIds: Array.from(categoryIds)
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
    } = req.body;

    const title = {
      en: category_en,
      ar: category_ar
    };

    const description = {
      en: decodeURIComponent(description_en || ''),
      ar: decodeURIComponent(description_ar || '')
    };


    let parentId = parent_category || null;
    const categoryData = new Category({
      title,
      description,
      parentId: parentId,
      createdBy: req.user._id,
      category_type: category_type == 'category_type' ? 'category' : 'sub_categories',
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
    const categoryDoc = await Category.findOne({
      _id: req.params.id,
      isDeleted: false,
      deletedAt: null,
    }).populate(['category_image', 'category_icon']);

    if (!categoryDoc) {
      return res.status(404).json(
        errorResponse(
          req.t(req.trans.messages.not_found, {
            attribute : req.trans.cruds.MODULE.CATEGORY,
          })
        )
      );
    }

    const category = {
      ...categoryDoc.toObject(),
      title: Object.fromEntries(categoryDoc.title),
      description: Object.fromEntries(categoryDoc.description),
    };

    return res.status(200).json(successResponse(
      req.t(req.trans.messages.fetch_success_message, {
        attribute: req.trans.cruds.MODULE.CATEGORY
      }), { category },
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
    };

    const parentId = category_type !== 'category_type' ? parent_category : null;
    const updateData = {
      title,
      description,
      category_type,
      parentId: parentId,
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

/* .... */
const createPostForm = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const lang = req.session.lang || 'en';

    const categoryDoc = await Category.findOne({
      _id: categoryId,
      isDeleted: false,
    });

    if (!categoryDoc) {
      req.flash("error_with_popup", req.t(req.trans.messages.not_found, {
        attribute: req.trans.cruds.MODULE.CATEGORY,
      }));
      return res.redirect('/admin/categories');
    }

    const existingCategoryAttributes = await CategoryAttribute.find({
      categoryId,
      isDeleted: false,
    }).populate('attributeId').lean();

    const savedAttributes = existingCategoryAttributes.map(catAttr => ({
      id: catAttr.attributeId._id.toString(),
      title: catAttr.attributeId.title[lang] || catAttr.attributeId.title.en,
      type: catAttr.attributeId.type,
      searchable: catAttr.searchable,
      position: catAttr.position
    }));

    const category = {
      ...categoryDoc.toObject(),
      title: Object.fromEntries(categoryDoc.title),
      description: Object.fromEntries(categoryDoc.description),
    };

    return res.render("backend/categories/form-builder", {
      category,
      savedAttributes: JSON.stringify(savedAttributes),
      mode: existingCategoryAttributes.length ? 'edit' : 'create',
    });
  } catch (error) {
    console.error("Create Post Form Error:", error);
    req.flash("error_with_popup", req.t(
      req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.CATEGORY,
      })
    );
    return res.redirect('/admin/categories');
  }
};

/* Fetch Selected Preview Attribute details */
async function fetchSelectedAttribute(req, res) {
  try {
    const { ids } = req.query ?? [];

    const attributeDocs = await Attribute.find({
      _id: { $in: ids },
      isDeleted: false,
    }).lean();

    if (!attributeDocs.length) {
      return res.status(404).json(errorResponse(
        req.t(req.trans.messages.not_found, {
          attribute: req.trans.cruds.MODULE.ATTRIBUTE,
        })
      ));
    }

    const attributes = await Promise.all(attributeDocs.map(async doc => {
      const options = await Promise.all(
        (Array.isArray(doc.options) ? doc.options : []).map(async (opt) => {
          const meta = opt.meta || {};

          const fileUrlEn = meta?.fileUrl_en ? meta?.fileUrl_en : '';
          const fileUrlAr = meta?.fileUrl_ar ? meta?.fileUrl_ar : '';

          const existsEn = await checkFileExists(fileUrlEn);
          const existsAr = await checkFileExists(fileUrlAr);

          const fallbackImage = 'backend/images/dummy-image.jpg';
          if (!existsEn) meta.fileUrl_en = fallbackImage;
          if (!existsAr) meta.fileUrl_ar = fallbackImage;

          return {
            _id: opt._id,
            value: opt.value || {},
            meta,
          };
        })
      );

      return {
        _id: doc._id,
        title: doc.title || {},
        description: doc.description || {},
        type: doc.type,
        label: doc.label || {},
        placeholder: doc.placeholder || {},
        options
      };
    }));

    return res.status(200).json(successResponse(
      req.t(req.trans.messages.fetch_success_message, {
        attribute: req.trans.cruds.MODULE.ATTRIBUTE
      }),
      { attributes }
    ));
  } catch (error) {
    logInfo('Fetch Selected Attribute Error:', error.stack);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.CATEGORY
      })
    ));
  }
}

/* 
*** Store Selected Attribute For Formbuilder...
*/
/* async function storeSelectedAttribute(req, res) {
  try {
    const categoryId = req.params.id;
    const items = req.body.items;

    if (!Array.isArray(items)) {
      return res.status(400).json(
        errorResponse(
          req.t(req.trans.messages.invalid_format, {
            attribute: req.trans.cruds.CATEGORY.form_builder.title_singular,
          })
        )
      );
    }

    const existingAttributes = await CategoryAttribute.find({
      categoryId, isDeleted: false
    });

    const stats = {
      inserted: 0, updated: 0, deleted: 0
    };
    const processedIds = new Set();

    for (const item of items) {
      const attributeId = item.id;
      if (!attributeId || !ObjectId.isValid(attributeId)) {
        continue;
      }

      processedIds.add(attributeId.toString());
      const searchable = item.searchable === 'true';

      const existing = existingAttributes.find(attr => 
        attr.attributeId.toString() === attributeId.toString()
      );

      if (existing) {
        if (existing.searchable !== searchable) {
          await CategoryAttribute.findByIdAndUpdate(
            existing._id,
            { searchable }
          );
          stats.updated++;
        }
      } else {
        await CategoryAttribute.create({
          categoryId,
          attributeId,
          searchable
        });
        stats.inserted++;
      }
    }

    const attributesToDelete = existingAttributes.filter(attr => 
      !processedIds.has(attr.attributeId.toString())
    );

    for (const attr of attributesToDelete) {
      await attr.softDelete(req.user?._id);
      stats.deleted++;
    }

    return res.status(200).json(
      successResponse(
        req.t(req.trans.messages.add_success_message, {
          attribute: req.trans.cruds.CATEGORY.form_builder.title_singular,
        }), { 
          stats,
          action: existingAttributes.length > 0 ? 'Edit' : 'Create'
    }, null, null, `/admin/categories/${categoryId}/create-post-form`));
  } catch (err) {
    logInfo('Store Selected Attribute Error:', err.stack);
    return res.status(500).json(
      internalServerErrorResponse(
        req.t(req.trans.messages.oops_something_went_wrong, {
          attribute: req.trans.cruds.MODULE.CATEGORY
        })
      )
    );
  }
} */
async function storeSelectedAttribute(req, res) {
  try {
    const categoryId = req.params.id;
    const items = req.body.items;
    
    if (!Array.isArray(items)) {
      return res.status(400).json(
        errorResponse(
          req.t(req.trans.messages.invalid_format, {
            attribute: req.trans.cruds.CATEGORY.form_builder.title_singular,
          })
        )
      );
    }

    const existingAttributes = await CategoryAttribute.find({
      categoryId, 
      isDeleted: false
    });

    const stats = {
      inserted: 0,
      updated: 0,
      deleted: 0,
      positionsUpdated: 0
    };
    const processedIds = new Set();

    if (existingAttributes.some(attr => attr.position === undefined)) {
      await Promise.all(
        existingAttributes.map(async (attr, index) => {
          if (attr.position === undefined) {
            attr.position = index + 1;
            await attr.save();
          }
        })
      );
    }

    for (const [index, item] of items.entries()) {
      const attributeId = item.id;
      if (!attributeId || !ObjectId.isValid(attributeId)) {
        continue;
      }

      processedIds.add(attributeId.toString());
      const searchable = item.searchable === 'true';
      const position = parseInt(item.position) || (index + 1);

      const existing = existingAttributes.find(attr => 
        attr.attributeId.toString() === attributeId.toString()
      );

      if (existing) {
        const updateFields = {};
        let needsUpdate = false;

        if (existing.searchable !== searchable) {
          updateFields.searchable = searchable;
          needsUpdate = true;
        }
        if (existing.position !== position) {
          updateFields.position = position;
          needsUpdate = true;
          stats.positionsUpdated++;
        }

        if (needsUpdate) {
          await CategoryAttribute.findByIdAndUpdate(
            existing._id,
            updateFields
          );
          stats.updated++;
        }
      } else {
        await CategoryAttribute.create({
          categoryId,
          attributeId,
          searchable,
          position
        });
        stats.inserted++;
      }
    }

    const attributesToDelete = existingAttributes.filter(attr => 
      !processedIds.has(attr.attributeId.toString())
    );

    for (const attr of attributesToDelete) {
      await attr.softDelete(req.user?._id);
      stats.deleted++;
    }

    return res.status(200).json(
      successResponse(
        req.t(req.trans.messages.add_success_message, {
          attribute: req.trans.cruds.CATEGORY.form_builder.title_singular,
        }), {
          stats,
          action: existingAttributes.length > 0 ? 'Edit' : 'Create',
        }, null, null, `/admin/categories/${categoryId}/create-post-form`
      )
    );

  } catch (err) {
    logInfo('Store Selected Attribute Error:', err.stack);
    return res.status(500).json(
      internalServerErrorResponse(
        req.t(req.trans.messages.oops_something_went_wrong, {
          attribute: req.trans.cruds.MODULE.CATEGORY
        })
      )
    );
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
  categoryImport,
  createPostForm,
  fetchSelectedAttribute,
  storeSelectedAttribute
};