const Notification = require("../../models/notification");
const { prepareMongooseDataTablesParams } = require("../../utils/helper");
const notificationTransformer = require('../../transformers/backend/notificationTransformer');
const { ObjectId } = require('mongoose').Types;
const { 
    successResponse, 
    errorResponse, 
    internalServerErrorResponse 
} = require('../../utils/apiResponses');

/**
 * Show a list of all notifications with pagination, sorting, and search
 */
async function index(req, res) {
    try {
        if (!req.xhr && !req.headers.accept.includes('json')) {
            return res.render('backend/notifications/index');
        }

        const { pageSize, pageStart, searchFilter, sortColumn, sortOrder } = prepareMongooseDataTablesParams(req, ['title', 'createdAt'], Notification.schema);
        const finalSortColumn = sortColumn || 'createdAt';
        const finalSortOrder = sortOrder === 'ASC' ? 1 : -1;

        const baseQuery = { isDeleted: false, notifyType: 'system', ...searchFilter };

        const unreadCount = await Notification.countDocuments({ isDeleted: false, notifyType: 'system', isRead: false });
        const totalCount = await Notification.countDocuments({ isDeleted: false, notifyType: 'system' });
        const filteredCount = await Notification.countDocuments(baseQuery);

        const notifications = await Notification.find(baseQuery)
            .skip(pageStart)
            .limit(pageSize)
            .sort({ [finalSortColumn]: finalSortOrder });

        const transformedNotifications = notificationTransformer.transformCollection(notifications, req.session.lang);
        
        return res.json({
            draw: parseInt(req.query.draw) || 1,
            unreadCount: unreadCount,
            recordsTotal: totalCount,
            recordsFiltered: filteredCount,
            data: transformedNotifications,
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.NOTIFICATION,
            })
        ));
    }
}

/**
 * Render the form to create a new notification
 */
async function create(req, res) {
    try {
        return res.render("backend/notifications/create", {
            notification: {},
        });
    } catch (error) {
        console.error("Error rendering notification creation form:", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.NOTIFICATION,
            })
        ));
    }
}

/**
 * Store a new notification in the database
 */
async function store(req, res) {
    const validationErrors = await addNotificationRequest(req);
    if (validationErrors) {
        return res.status(400).json(errorResponse(req.trans.messages.validation_error, validationErrors));
    }

    try {
        
    } catch (error) {
        console.error('Error creating notification:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.NOTIFICATION,
            })
        ));
    }
}

/**
 * Show a single notification by ID
 */
async function show(req, res) {
    try {
        const filter = {
            _id: req.params.id,
            isDeleted: false,
        };
        const notificationDoc = await Notification.findOne(filter).populate({
            path: 'senderId',
            select: '_id first_name middle_name last_name email'
        }).populate({
            path: 'recipientId',
            select: '_id first_name middle_name last_name email'
        });

        if (!notificationDoc || notificationDoc.isDeleted) {
            return res.status(404).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute: req.trans.cruds.MODULE.NOTIFICATION
                })
            ));
        }

        const notification = {
            ...notificationDoc.toObject(),
            title: Object.fromEntries(notificationDoc.title),
            description: Object.fromEntries(notificationDoc.description),
        };
        await notificationDoc.markAsRead();
        await notificationDoc.markAsSeen();
        return res.render('backend/notifications/show', {
            notification,
        });
    } catch (error) {
        console.error("Error fetching notification:", error);
        req.flash("error_with_popup", req.t(
            req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.NOTIFICATION,
            })
        );
        return res.redirect('/admin/notifications');
    }
}

/**
 * Render the form to edit an existing notification
 */
async function edit(req, res) {
    try {
        
    } catch (error) {
        console.error("Error fetching notification for editing:", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.NOTIFICATION,
            })
        ));
    }
}

/**
 * Update an existing notification by ID
 */
async function update(req, res) {
    const validationErrors = await editNotificationRequest(req);
    if (validationErrors) {
        return res.status(400).json(errorResponse(req.trans.messages.validation_error, validationErrors));
    }

    try {
        
    } catch (error) {
        console.error("Error updating notification:", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.NOTIFICATION,
            })
        ));
    }
} 

/**
 * Soft delete a notification by ID
 */
async function destroy(req, res) {
    try {
        const filter = {
            _id: req.params.id,
            isDeleted: false,
        };
        const notification = await Notification.findOne(filter);
        if (!notification || notification.isDeleted) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute: req.trans.cruds.MODULE.NOTIFICATION
                })
            ));
        }
        await notification.softDelete();
        return res.status(200).json(successResponse(
            req.t(req.trans.messages.delete_success_message, {
                attribute: req.trans.cruds.MODULE.NOTIFICATION
            }),{ notification 
        },null, null, '/admin/notifications'));
    } catch (error) {
        console.error("Error deleting notification: ", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.NOTIFICATION
            })
        ));
    }
}

/* 
** Mark as read...
*/
async function readNotification(req, res) {
    try {
        const filter = {
            _id: req.params.id,
            isDeleted: false,
        };
        
        const notification = await Notification.findOne(filter);

        if (!notification) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute: req.trans.cruds.MODULE.NOTIFICATION
                })
            ));
        }

        await notification.markAsRead();
        return res.status(200).json(successResponse(
            req.t(req.trans.messages.update_success_message, {
                attribute: req.trans.cruds.MODULE.NOTIFICATION
            }),{ notification 
        },null, null, '/admin/notifications'));
    } catch (error) {
        console.error("Error mark as read notification: ", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.NOTIFICATION
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
    readNotification
};
