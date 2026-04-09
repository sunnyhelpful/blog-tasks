const Announcement = require("../../models/announcement");
const { prepareMongooseDataTablesParams } = require("../../utils/helper");
const announcementTransformer = require('../../transformers/backend/announcementTransformer');
const { 
  addAnnouncementRequest, 
  editAnnouncementRequest 
} = require('../../requests/backend/announcementRequest');
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
async function index(req, res) {
  try {
    if (!req.xhr && !req.headers.accept.includes('json')) {
      return res.render('backend/announcements/index');
    }

    const { pageSize, pageStart, searchFilter, sortColumn, sortOrder } = prepareMongooseDataTablesParams(req, ['title', 'createdAt'], Announcement.schema);
    
    const finalSortColumn = sortColumn || 'createdAt';
    const finalSortOrder = sortOrder === 'ASC' ? 1 : -1;
 
    const totalCount = await Announcement.countDocuments({ isDeleted: false });
    const filteredCount = await Announcement.countDocuments({ isDeleted: false, ...searchFilter });
 
    const announcements = await Announcement.find({ isDeleted: false, ...searchFilter })
        .skip(pageStart)
        .limit(pageSize)
        .sort({ [finalSortColumn]: finalSortOrder });

    const transformedAnnouncements = announcementTransformer.transformCollection(announcements, req.session.lang);

    return res.json({
      draw: parseInt(req.query.draw) || 1,
      recordsTotal: totalCount,
      recordsFiltered: filteredCount,
      data: transformedAnnouncements,
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute : req.trans.cruds.MODULE.ANNOUNCEMENT
      })
    ));
  }
}

/**
 * Create a role
 */
async function create(req, res) {
  try {
    return res.render("backend/announcements/create", {
      announcement: {},
    });
  } catch (error) {
    console.error('Error preparing announcement creation:', error);
    req.flash("error_with_popup", req.t(
        req.trans.messages.oops_something_went_wrong, {
            attribute: req.trans.cruds.MODULE.ANNOUNCEMENT, 
        })
    );
    return res.redirect('/admin/announcements');
  }
}
/**
 * Store a new category in the database
 */
async function store(req, res) {
  const validationErrors = await addAnnouncementRequest(req);
  if (validationErrors) {
    return res.status(400).json(errorResponse(req.trans.messages.validation_error, validationErrors));
  }
  try{
    const {
      title_en,
      title_ar,
      description_en,
      description_ar,
      start_date,
      end_date,
    } = req.body;

    const title = {
      en: title_en,
      ar: title_ar
    };

    const description = {
      en: description_en,
      ar: description_ar
    };

    const data = new Announcement({
      title,
      description,
      start_date,
      end_date,
      createdBy: req.user._id,
    });
    const store = await Announcement.create(data);
    
    return res.status(201).json(
      successResponse(
        req.t(req.trans.messages.add_success_message, {
          attribute : req.trans.cruds.MODULE.ANNOUNCEMENT
        }), {
          store,
    }, null, null, '/admin/announcements'));
  } catch(error){
    logInfo('Error creating announcement:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute : req.trans.cruds.MODULE.ANNOUNCEMENT
      })
    ));
  }
}

/**
 * Show a single announcement by ID
 */
async function show(req, res) {
  try {
    const { id } = req.params;
    const filter = {
      _id: id,
      isDeleted: false,
    }

    const announcementDoc = await Announcement.findOne(filter);

    const formatDate = (date) => {
      return new Date(date).toISOString().split('T')[0];
    };
    const announcement = {
      ...announcementDoc.toObject(),
      title: Object.fromEntries(announcementDoc.title),
      description: Object.fromEntries(announcementDoc.description),
      dateRange: `${formatDate(announcementDoc.start_date)} to ${formatDate(announcementDoc.end_date)}`
    };
    if(!announcement){
      req.flash("error_with_popup", req.t(req.trans.messages.not_found, {
        attribute: req.trans.cruds.MODULE.ANNOUNCEMENT,
      }));
      return res.redirect('/admin/announcements');
    }
    
    return res.render("backend/announcements/show", {
      announcement,
    });
  } catch (error) {
    console.error("Error fetching announcement: ", error);
    req.flash("error_with_popup", req.t(req.trans.messages.oops_something_went_wrong, {
      attribute: req.trans.cruds.MODULE.ANNOUNCEMENT,
    }));
    return res.redirect('/admin/announcements');
  }
}



/**
 * Render a form to edit an existing announcement
 */
async function edit(req, res) {
  try {
    const announcementDoc = await Announcement.findById(req.params.id);

    const formatDate = (date) => {
      return new Date(date).toISOString().split('T')[0];
    };
    const announcement = {
      ...announcementDoc.toObject(),
      title: Object.fromEntries(announcementDoc.title),
      description: Object.fromEntries(announcementDoc.description),
      dateRange: `${formatDate(announcementDoc.start_date)} to ${formatDate(announcementDoc.end_date)}`
    };

    return res.render("backend/announcements/edit", {
      announcement,
    });
  } catch (error) {
    console.error("Error fetching category for editing: ", error);
    req.flash("error_with_popup", 
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.ANNOUNCEMENT,
      })
    );
    return res.redirect('/admin/announcements');
  }
}

/**
 * Update an existing category by ID
 */
async function update(req, res) {
  const validationErrors = await editAnnouncementRequest(req);
  if (validationErrors) {
    return res.status(400).json(errorResponse(req.trans.messages.validation_error, validationErrors));
  }
  try {
    const {
      title_en,
      title_ar,
      description_en,
      description_ar,
      start_date,
      end_date,
    } = req.body;

    const title = {
      en: title_en,
      ar: title_ar
    };

    const description = {
      en: description_en,
      ar: description_ar
    };

    const data = {
      title,
      description,
      start_date,
      end_date,
      updatedBy: req.user._id,
    };

    const updatedData = await Announcement.findByIdAndUpdate(req.params.id, data, { new: true });

    return res.status(200).json(
      successResponse(
        req.t(req.trans.messages.update_success_message, {
          attribute: req.trans.cruds.MODULE.ANNOUNCEMENT
        }),
        { updatedData },
        null,
        null,
        '/admin/announcements'
      )
    );
  } catch (error) {
    console.error("Error updating announcement:", error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.ANNOUNCEMENT
      })
    ));
  }
}


/**
 * Soft delete a announcement by ID
 */
async function destroy(req, res) {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement || announcement.isDeleted) {
      return res.status(400).json(errorResponse(
        req.t(req.trans.messages.not_found, {
          attribute : req.trans.cruds.MODULE.ANNOUNCEMENT
        })
      ));
    }

    await announcement.softDelete(req.user._id);

    return res.status(200).json(
      successResponse(
        req.t(req.trans.messages.delete_success_message, {
          attribute : req.trans.cruds.MODULE.ANNOUNCEMENT
        }), {
          announcement,
    }, null, null, '/admin/announcements'));
  } catch (error) {
    console.error("Error deleting announcement: ", error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute : req.trans.cruds.MODULE.ANNOUNCEMENT
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
            attribute : req.trans.cruds.ANNOUNCEMENT.fields.status,
          })
        )
      );
    }

    await Announcement.findByIdAndUpdate(id, { status });
    return res.status(200).json(
      successResponse(
        req.t(req.trans.messages.key_update, {
          attribute : req.trans.cruds.MODULE.ANNOUNCEMENT,
          status : status,
        }), {
    }, null, null, null));
  } catch (error) {
    console.error('Error while updating announcements status:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute : req.trans.cruds.MODULE.ANNOUNCEMENT
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