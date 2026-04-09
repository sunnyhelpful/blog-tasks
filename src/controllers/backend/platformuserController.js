const User = require("../../models/user");
const Role = require("../../models/role");
const Upload = require("../../models/upload");
const { saveUpload } = require('../../utils/saveUpload');
const { prepareMongooseDataTablesParams } = require("../../utils/helper");
const userTransformer = require('../../transformers/backend/userTransformer');
const { addUserRequest, editUserRequest } = require('../../requests/backend/userRequest');
const bcrypt = require('bcryptjs');
const ejs = require('ejs');
const { 
    transporter, 
    sender 
} = require('../../config/mailer');
const path = require('path');

const {
    successResponse,
    errorResponse,
    internalServerErrorResponse,
} = require('../../utils/apiResponses');

/**
 * Show a list of all users with pagination, sorting, and search
 */
async function index(req, res) {
    try {
        if (!req.xhr && !req.headers.accept.includes('json')) {
            return res.render('backend/platform-users/index');
        }

        const { pageSize, pageStart, searchFilter, sortColumn, sortOrder } = prepareMongooseDataTablesParams(
            req, 
            ['first_name', 'middle_name', 'last_name', 'username', 'email', 'phone_number', 'createdAt'],
            User.schema
        );

        if (req.query.status) {
            searchFilter.status = req.query.status;
        }

        const finalSortColumn = sortColumn || 'createdAt';
        const finalSortOrder = sortOrder === 'ASC' ? 1 : -1;

        /* const pipeline = [
            { $match: { isDeleted: false, account_type: 'platform_user', ...searchFilter } },
            {
                $lookup: {
                from: 'roles',
                localField: 'role_id',
                foreignField: '_id',
                as: 'role',
                },
            },
            { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
            {
                $facet: {
                    totalCount: [
                        { $match: { 'role.name': { $ne: 'admin' } } },
                        { $count: 'count' }
                    ],
                    
                    filteredCount: [
                        { $match: { 'role.name': { $ne: 'admin' } } },
                        { $count: 'count' }
                    ],
                    paginatedResults: [
                        { $match: { 'role.name': { $ne: 'admin' } } },
                        {
                            $project: {
                                id: '$_id',
                                first_name: 1,
                                last_name: 1,
                                email: 1,
                                status: 1,
                                createdAt: 1,
                                role: '$role.name',
                            },
                        },
                        { $sort: { [finalSortColumn]: finalSortOrder } },
                        { $skip: pageStart },
                        { $limit: pageSize },
                    ],
                },
            },
        ]; 
        const [result] = await User.aggregate(pipeline);

        const totalCountValue = result.totalCount[0]?.count || 0;
        const filteredCountValue = result.filteredCount[0]?.count || 0;
        const transformedUsers = userTransformer.transformCollection(result.paginatedResults);

        return res.json({
            draw: parseInt(req.query.draw) || 1,
            recordsTotal: totalCountValue,
            recordsFiltered: filteredCountValue,
            data: transformedUsers,
        });
        */
        const baseMatch = {
            isDeleted: false,
            account_type: 'platform_user',
            ...(req.query.status ? { status: Number(req.query.status) } : {}),
            ...searchFilter,
        };

        const pipeline = [
            { $match: baseMatch },
            { $sort: { [finalSortColumn]: finalSortOrder } },
            { $skip: pageStart },
            { $limit: pageSize },
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role_id',
                    foreignField: '_id',
                    as: 'role',
                },
            },
            { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
            { $match: { 'role.name': { $ne: 'admin' } } },
            {
                $project: {
                    id: '$_id',
                    first_name: 1,
                    last_name: 1,
                    username: 1,
                    email: 1,
                    phone_number: 1,
                    status: 1,
                    createdAt: 1,
                    role: '$role.name',
                },
            },
        ];

        const totalCountValue = await User.countDocuments({
            isDeleted: false,
            account_type: 'platform_user',
            ...(req.query.status ? { status: Number(req.query.status) } : {}),
            ...searchFilter,
        });
        
        const filteredCountValue = totalCountValue; 
        const results = await User.aggregate(pipeline);
        const transformedUsers = userTransformer.transformCollection(results);
        return res.json({
            draw: parseInt(req.query.draw) || 1,
            recordsTotal: totalCountValue,
            recordsFiltered: filteredCountValue,
            data: transformedUsers,
        });
    } catch (error) {
        console.error('Error fetching platform users:', error);
        if (!req.xhr && !req.headers.accept.includes('json')) {
            return res.status(500).render('common/pages/page-500', {
                layout: 'layouts/pageLayout',
                errorDetails: error.message,
                redirectUrl: '/admin/platform-users',
            });
        } else {
            return res.status(500).json(internalServerErrorResponse(
                req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.PLATFORM_USER,
                })
            ));
        }
    }
}

/**
 * Create a user
 */
async function create(req, res) {
    try {
        const roles = await Role.find({
        isDeleted: false,
        deletedAt: null,
        });

        return res.render("backend/platform-users/create", {
        roles: roles,
        user: {},
        profileImageUrl: null,
        });
    } catch (error) {
        console.error('Error preparing platform user creation:', error);
        req.flash("error_with_popup", req.t(
            req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.PLATFORM_USER, 
            })
        );
        return res.redirect('/admin/platform-users');
    }
}

/**
 * Store a new user
 */
async function store(req, res) {
    try {
        const validationErrors = await addUserRequest(req);
        if (validationErrors) {
            return res.status(400).json(errorResponse(req.trans.auth.validation_error, validationErrors));
        }

        const user = {
            first_name: req.body.first_name,
            middle_name: req.body.middle_name,
            last_name: req.body.last_name,
            username: req.body.username,
            email: req.body.email,
            phone_number: req.body.phone_number,
            password: req.body.password,
            role_id: req.body.role,
            isVerified: true,
            createdBy: req.user._id,
            account_type: 'platform_user',
        };

        const saveData = await User.create(user);

        let fileMetadata = null;
        if (req.file) {
            const isS3 = !!process.env.AWS_SDK_API_KEY && !!process.env.AWS_SDK_API_SECRET_KEY;
            fileMetadata = await saveUpload(saveData._id, 'User', req.file, isS3);
        }

        const emailContent = await ejs.renderFile(
            path.resolve('views/backend/emails/credential-sent.ejs'),
            {
                name: `${saveData.first_name} ${saveData.last_name}`,
                email: saveData.email,
                password: req.body.password,
                message: 'Your system user account has been successfully created.',
            }
        );
        
        const mailOptions = {
            from: `"${sender.name}" <${sender.address}>`,
            to: saveData.email,
            subject: 'Your Account Has Been Created',
            html: emailContent,
        };
        //await transporter.sendMail(mailOptions);

        return res.status(201).json(successResponse(
            req.t(req.trans.messages.add_success_message, {
                attribute : req.trans.cruds.USER.title_singular
            }), { saveData }, 
        null, null, '/admin/platform-users'));
    } catch (error) {
        console.error('Error creating platform user:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.PLATFORM_USER,
            })
        ));
    }
}

/**
 * Show a specific user
 */
async function show(req, res) {
    try {
        const { id } = req.params;
        const filter = {
            _id: id,
            isDeleted: false,
        };

        const userInfo = await User.findOne(filter)
        .populate({
            path: 'role_id',
            populate: {
                path: 'role_permissions',
                select: 'permission_id',
                match: { isDeleted: false },
                populate: {
                path: 'fetch_permissions',
                select: 'name title'
                }
            }
        });

        if (!userInfo || userInfo.length === 0) {
            req.flash("error_with_popup", req.t(req.trans.messages.not_found, {
                attribute: req.trans.cruds.MODULE.PLATFORM_USER,
            }));
            return res.redirect('/admin/platform-users');
        }

        // console.log('User Info:', userInfo);
        return res.render('backend/platform-users/show', {
            user: userInfo,
        });
    } catch (error) {
        console.error('Error fetching platform user:', error);
        req.flash("error_with_popup", req.t(
            req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.PLATFORM_USER,
            })
        );
        return res.redirect('/admin/platform-users');
    }
}

/**
 * Display form data for editing a user (not typically needed for API, but included)
 */
async function edit(req, res) {
    try {
        const { id } = req.params;
        const filter = { 
            _id: id, 
            isDeleted: false,
        };
        const user = await User.findOne(filter);
        if (!user) {
            req.flash("error_with_popup", req.t(
                req.trans.messages.not_found, {
                attribute: req.trans.cruds.MODULE.PLATFORM_USER, 
                })
            );
            return res.redirect('/admin/platform-users');
        }
        const roles = await Role.find({
            isDeleted: false,
            deletedAt: null,
        });

        const upload = await Upload.findOne({ uploadsable_id: user._id, uploadsable_type: 'User' }).sort({ createdAt: -1 });
        const profileImageUrl = upload ? '/' + upload.file_path : null;

        return res.render("backend/platform-users/edit", {
            roles: roles,
            user: user,
            profileImageUrl: profileImageUrl,
        });
    } catch (error) {
        req.flash("error_with_popup", req.t(
            req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.PLATFORM_USER, 
            })
        );
        return res.redirect('/admin/platform-users');
    }
}

/**
 * Update a user
 */
async function update(req, res) {
    try {
        const validationErrors = await editUserRequest(req);
        if (validationErrors) {
            return res.status(400).json(errorResponse(req.trans.auth.validation_error, validationErrors));
        }
        const user = {
            first_name: req.body.first_name,
            middle_name: req.body.middle_name,
            last_name: req.body.last_name,
            username: req.body.username,
            email: req.body.email,
            phone_number: req.body.phone_number,
            role_id: req.body.role,
            createdBy: req.user._id
        };
        if (req.body.password) {
            user.password = await bcrypt.hash(req.body.password, 10);
        }
        const userUpdate = await User.findByIdAndUpdate(req.params.id, user, { new: true });
        if (!userUpdate && userUpdate.isDeleted) {
            return res.status(404).json(errorResponse('User not found!'));
        }

        let fileMetadata = null;
        if (req.file) {
            const isS3 = !!process.env.AWS_SDK_API_KEY && !!process.env.AWS_SDK_API_SECRET_KEY;
            fileMetadata = await saveUpload(userUpdate._id, 'User', req.file, isS3);
        }

        return res.status(201).json(successResponse(
            req.t(req.trans.messages.update_success_message, {
                attribute : req.trans.cruds.USER.title_singular
            }), { userUpdate
        }, null, null, '/admin/platform-users'));
    } catch (error) {
        console.error('Error updating platform user:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.PLATFORM_USER,
            })
        ));
    }
}

/**
 * Soft delete a user
 */
async function destroy(req, res) {
    try {
        const { id } = req.params;

        const user = await User.findOne({ _id: id, isDeleted: false });
        if (!user) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute : req.trans.cruds.MODULE.PLATFORM_USER
                })
            ));
        }

        await user.softDelete(req.user._id);
        return res.json(successResponse(
            req.t(req.trans.messages.delete_success_message, {
                attribute : req.trans.cruds.USER.title_singular
        }), { id }));
    } catch (error) {
        console.error('Error deleting platform user:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.PLATFORM_USER,
            })
        ));
    }
}

/* User Status */
async function statusUpdate(req, res) {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.invalid_key, {
                    attribute: req.trans.cruds.USER.fields.status,
                })
            ));
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json(
                errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute: req.trans.cruds.USER.fields.status,
                })
                )
            );
        }

        if (status === 'active') {
            await user.reactivateUser();
        } else if (status === 'inactive') {
            await user.suspendUser();
        }

        return res.status(200).json(successResponse(
            req.t(req.trans.messages.key_update, {
                attribute: req.trans.cruds.MODULE.PLATFORM_USER,
                status: status,
            }),{}, null, null, null
        ));
    } catch (error) {
        console.error('Error while updating platform user status:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.PLATFORM_USER
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