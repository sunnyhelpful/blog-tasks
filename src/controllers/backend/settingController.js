const Setting = require("../../models/setting");
const Uploads = require("../../models/upload");
const { prepareMongooseDataTablesParams, deleteFileIfExistsUsingName } = require("../../utils/helper");
const { saveUpload } = require('../../utils/saveUpload');
const settingTransformer = require('../../transformers/backend/settingTransformer');
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
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      const searchableFields = ['details', 'status'];
    
      const { pageSize, pageStart, searchFilter, sortColumn, sortOrder } =
        prepareMongooseDataTablesParams(req, searchableFields, Setting.schema);
    
      const validSortColumns = ['createdAt', 'details', 'status'];
      const safeSortColumn = validSortColumns.includes(sortColumn) ? sortColumn : 'createdAt';
    
      let statusFilter = req.query.status;
      if (statusFilter !== undefined && statusFilter !== null) {
        statusFilter = statusFilter === '1' ? 1 : (statusFilter === '0' ? 0 : undefined);
      }
    
      const whereClause = { ...searchFilter };
      if (statusFilter !== undefined) {
        whereClause.status = statusFilter;
      }
    
      const totalCount = await Setting.countDocuments({});
      const filteredCount = await Setting.countDocuments(whereClause);
    
      const rows = await Setting.find(whereClause)
        .sort({ [safeSortColumn]: sortOrder === 'desc' ? -1 : 1 })
        .skip(pageStart)
        .limit(pageSize);
    
      const transformedSettings = settingTransformer.transformCollection(rows, req.session.lang);
    
      return res.json({
        draw: parseInt(req.query.draw) || 1,
        recordsTotal: totalCount,
        recordsFiltered: filteredCount,
        data: transformedSettings,
      });
    }
    
    return res.render('backend/settings/index');
  } catch (error) {
    console.error('Error fetching settings:', error);
    if (!req.xhr && !req.headers.accept.includes('json')) {
      return res.status(500).render('common/pages/page-500', {
        layout: 'layouts/pageLayout',
        errorDetails: error.message,
        redirectUrl: '/admin/settings',
      });
    } else {
      return res.status(500).json(internalServerErrorResponse(
        req.t(req.trans.messages.oops_something_went_wrong, {
          attribute: req.trans.cruds.MODULE.SETTING,
        })
      ));
    }
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
    const authUser = req.user;
    const { id } = req.params;
    const settingDoc = await Setting.findById(id).populate('uploads');
    if (!settingDoc) {
      req.flash("error_with_popup", req.t(
        req.trans.messages.not_found, {
          attribute: req.trans.cruds.MODULE.SETTING, 
        })
      );
      return res.redirect('/admin/settings');
    }

    const setting = {
      ...settingDoc.toObject(),
      value: Object.fromEntries(settingDoc.value),
      display_name: Object.fromEntries(settingDoc.display_name),
      details: Object.fromEntries(settingDoc.details),
    };

    return res.render('backend/settings/edit', {
      setting: setting
    });
  } catch (error) {
    console.error('Error preparing setting edit:', error);
    req.flash("error_with_popup", req.t(
      req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.SETTING,
      })
    );
    return res.redirect('/admin/users');
  }
}

/**
 * Update a setting
 */
async function update(req, res) {
    try {
      const { id } = req.params;
      const { display_name_en, display_name_ar, value_en, value_ar } = req.body;

      const display_name = {
        en: display_name_en,
        ar: display_name_ar,
      };

      const value = {
        en: value_en,
        ar: value_ar,
      };

      const setting = await Setting.findById(id);
      if (!setting) {
        return res.status(404).json(errorResponse('Setting not found.'));
      }  
      const valueData = req.file ? 'file' : value;
      setting.display_name = display_name || setting.display_name;
      setting.value = valueData || setting.value;
      setting.createdBy = req.user.id;
      await setting.save();

      let fileMetadata = null;
      if (req.file) {
        const isS3 = !!process.env.AWS_SDK_API_KEY && !!process.env.AWS_SDK_API_SECRET_KEY;
        const settingUpload = await Uploads.findOne({
          where: {
            uploadsable_id: id,
            uploadsable_type: 'Setting',
            deletedAt: null,
          },
          order: [['createdAt', 'DESC']]
        });
        if (settingUpload) {
          await deleteFileIfExistsUsingName(settingUpload.file_path);
          
          await Uploads.destroy({
            where: {
              uploadsable_id: id,
              uploadsable_type: 'Setting',
              file_path: settingUpload.file_path
            }
          });
        }
        fileMetadata = await saveUpload(id, 'Setting', req.file, isS3);
      }

      return res.status(200).json(
        successResponse(
          req.t(req.trans.messages.update_success_message, {
            attribute : req.trans.cruds.SETTING.title_singular
          }), {
            setting,
      }, null, null, '/admin/settings'));
    } catch (error) {
      console.error('Error updating setting:', error);
      return res.status(500).json(internalServerErrorResponse(
        req.t(req.trans.messages.oops_something_went_wrong, {
          attribute: req.trans.cruds.MODULE.SETTING,
        })
      ));
    }
}

/**
 * Soft delete a setting
 */
async function destroy(req, res) {
  try {
    const { id } = req.params;

    const setting = await Setting.findById(id);
    await setting.softDelete();
    return res.status(200).json(successResponse("Setting deleted successfully!", {
      setting
    }, null, null));
  } catch (error) {
    console.error('Error deleting setting:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.SETTING,
      })
    ));
  }
}
/**
 * Soft delete a setting
 */
async function statusUpdate(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (typeof status === 'undefined') {
      return res.status(404).json(
        errorResponse(
          req.t(req.trans.messages.not_found, {
            attribute: req.trans.cruds.MODULE.SETTING,
          })
        )
      );
    }

    const updated = await Setting.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json(
        errorResponse(
          req.t(req.trans.messages.not_found, {
            attribute: req.trans.cruds.MODULE.SETTING,
          })
        )
      );
    }
    
    return res.status(200).json(
      successResponse(
        req.t(req.trans.messages.key_update, {
          attribute: req.trans.cruds.MODULE.SETTING,
          status: status == 1 ? 'Active' : 'Inactive',
        }),
        {}, null, null, null
      )
    );
  } catch (error) {
    console.error("Error while updating setting status:", error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.SETTING
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