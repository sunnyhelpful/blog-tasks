const Setting = require("../../models/setting");
const settingTransformer = require('../../transformers/api/settingTransformer');
const formatIdentifier = require('../../utils/identifierFormat');

const { 
    preparePaginationParams,
    buildSearchFilterMongoose
} = require("../../utils/helper");
const {
  successResponse,
  errorResponse,
  internalServerErrorResponse,
} = require('../../utils/apiResponses');

/**
 * Show a list of all settings
 */
async function index(req, res) {
  try {
    // const lanuage = req.headers["accept-language"] || 'en';
    const searchableFields = ['display_name'];

    const paginationParams = await preparePaginationParams(req);
    paginationParams.limit = 20;
    if (!paginationParams) {
      return res.status(400).json(errorResponse(req.trans.messages.invalid_pagination_parameters));
    }

    const filter = {
        status: 1,
        isDeleted: false,
    };

    const searchFilter = buildSearchFilterMongoose(req.query, searchableFields, Setting.schema);
    if (searchFilter.$or && searchFilter.$or.length) {
        filter.$and = [searchFilter];
    }

    const [settingList, total] = await Promise.all([
        Setting.find(filter).sort(paginationParams.sort).skip(paginationParams.skip).limit(paginationParams.limit).lean(),
        Setting.countDocuments(filter)
    ]);

    const data = settingTransformer.transformCollection(settingList, req.session.lang);
    return res.json(successResponse(
        req.t(req.trans.messages.add_success_message, {
          attribute: req.trans.cruds.MODULE.SETTING
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
      console.error('Error fetching settings:', error.stack);
      return res.status(500).json(internalServerErrorResponse('Failed to retrieve settings'));
  }
}



/**
 * Create a setting
 */
async function create(req, res) {
  try {
    
  } catch (error) {
    console.error('Error preparing setting creation:', error);
    return res.status(500).json(internalServerErrorResponse('Failed to prepare setting creation'));
  }
}

/**
 * Store a new setting
 */
async function store(req, res) {
  try {
    
  } catch (error) {
    console.error('Error creating setting:', error);
    return res.status(500).json(internalServerErrorResponse('Failed to create setting'));
  }
}

/**
 * Show a specific setting
 */
async function show(req, res) {
  try {
    const idOrSlug = req.params.id_or_slug;
    const identifierCondition = formatIdentifier(idOrSlug);

    const filter = {
      ...identifierCondition,
      isDeleted: false,
    };

    const settingDoc = await Setting.findOne(filter).lean();
    if (!settingDoc) {
      return res.status(404).json(errorResponse(
        req.t(req.trans.messages.not_found, {
          attribute: req.trans.cruds.MODULE.SETTING,
        })
      ));
    }

    const lang = req.session.lang || 'en';
    const getValue = (field) => {
      const obj = settingDoc[field];
      if (!obj || typeof obj !== 'object') return '';
      return obj[lang] || obj['en'] || '';
    };

    const setting = {
      id: settingDoc._id,
      slug: settingDoc.slug,
      key: settingDoc.key,
      value: getValue('value'),
      display_name: getValue('display_name'),
      details: getValue('details'),
      type: settingDoc.type,
      status: settingDoc.status,
      createdAt: settingDoc.createdAt,
      updatedAt: settingDoc.updatedAt,
    };

    return res.json(successResponse(
      req.t(req.trans.messages.fetch_success_message, {
        attribute: req.trans.cruds.MODULE.SETTING
      }), { setting },
      null, null, null
    ));
  } catch (error) {
    console.error('Error fetching setting:', error);
    return res.status(500).json(internalServerErrorResponse('Failed to retrieve setting'));
  }
}

/**
 * Display form data for editing a setting (not typically needed for API, but included)
 */
async function edit(req, res) {
  try {

  } catch (error) {
    console.error('Error preparing setting edit:', error);
    return res.status(500).json(internalServerErrorResponse('Failed to prepare setting edit'));
  }
}

/**
 * Update a setting
 */
async function update(req, res) {
    try {

    } catch (error) {
      console.error('Error updating setting:', error);
      return res.status(500).json(internalServerErrorResponse('Failed to update setting'));
    }
}

/**
 * Soft delete a setting
 */
async function destroy(req, res) {
  try {
    
  } catch (error) {
    console.error('Error deleting setting:', error);
    return res.status(500).json(internalServerErrorResponse('Failed to delete setting'));
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