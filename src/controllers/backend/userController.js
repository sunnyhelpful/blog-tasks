const User = require("../../models/user");
const Role = require("../../models/role");
const Upload = require("../../models/upload");
const Address= require("../../models/address");
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
      return res.render('backend/system-users/index');
    }

    const customFieldTypes = {
      'work_schedule.last_working_date': 'Date',
    };

    const { pageSize, pageStart, searchFilter, sortColumn, sortOrder } = prepareMongooseDataTablesParams(
      req, 
      ['first_name', 'middle_name', 'last_name', 'username', 'email', 'phone_number', 'createdAt', 'work_schedule.last_working_date'], 
      User.schema,
      Address.schema,
      customFieldTypes
    );

    if (req.query.status) {
      searchFilter.status = req.query.status;
    }

    const finalSortColumn = sortColumn || 'createdAt';
    const finalSortOrder = sortOrder === 'ASC' ? 1 : -1;

    /* const pipeline = [
      { $match: { isDeleted: false, account_type: 'system_user', ...searchFilter } },
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
      account_type: 'system_user',
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
                last_working_date: '$work_schedule.last_working_date',
                role: '$role.name',
            },
        },
    ];

    const adminRole = await Role.findOne({ name: 'admin', isDeleted: false, });
    const totalCountValue = await User.countDocuments({
      isDeleted: false,
      account_type: 'system_user',
      ...(req.query.status ? { status: Number(req.query.status) } : {}),
      ...searchFilter,
      role_id: { $ne: adminRole._id }
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
    console.error('Error fetching users:', error);
    if (!req.xhr && !req.headers.accept.includes('json')) {
      return res.status(500).render('common/pages/page-500', {
        layout: 'layouts/pageLayout',
        errorDetails: error.message,
        redirectUrl: '/admin/users',
      });
    } else {
      return res.status(500).json(internalServerErrorResponse(
        req.t(req.trans.messages.oops_something_went_wrong, {
          attribute: req.trans.cruds.MODULE.SYSTEM_USER,
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

    return res.render("backend/system-users/create", {
      roles: roles,
      user: {},
      profileImageUrl: null,
    });
  } catch (error) {
    console.error('Error preparing user creation:', error);
    req.flash("error_with_popup", req.t(
      req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.SYSTEM_USER, 
      })
    );
    return res.redirect('/admin/users');
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
      country_code: req.body.country_code,
      phone_number: req.body.phone_number,
      password: req.body.password,
      role_id: req.body.role,
      isVerified: true,
      createdBy: req.user._id,
      account_type: 'system_user',
    };

    const saveData = await User.create(user);

    const address = {
      userId: saveData._id,
      building_name: req.body.building_name,
      street: req.body.street,
      area: req.body.area,
      city: req.body.city,
      postal_code: req.body.postal_code,
      emirate: req.body.emirate,
      country: req.body.country,
      address_type: 'office',
    };
 
    const saveAddressData = await Address.create(address);

    let fileMetadata = null;
    if (req.file) {
      const isS3 = !!process.env.AWS_SDK_API_KEY && !!process.env.AWS_SDK_API_SECRET_KEY;
      fileMetadata = await saveUpload(saveData._id, 'User', req.file, isS3);
    }

    await saveData.setWorkingDays(365);

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
    await transporter.sendMail(mailOptions);

    const url = req.body.save_continue == 1 ? '/admin/user/create' : '/admin/users';
    return res.status(201).json(successResponse(
        req.t(req.trans.messages.add_success_message, {
          attribute : req.trans.cruds.USER.title_singular
        }), { saveData,
    }, null, null, url));
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.SYSTEM_USER,
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
    }).populate('user_profile').populate('address');

    const lang = req.session.lang || 'en';

    const localizedPermissions = userInfo.role_id.role_permissions.map(rp => {
        const permission = rp.fetch_permissions;
        return {
            name: permission?.name || '',
            title: permission?.title?.get(lang) || permission?.title?.get('en') || '',
        };
    });

    if (!userInfo || userInfo.length === 0) {
      req.flash("error_with_popup", req.t(req.trans.messages.not_found, {
        attribute: req.trans.cruds.MODULE.SYSTEM_USER,
      }));
      return res.redirect('/admin/users');
    }

    return res.render('backend/system-users/show', {
      user: userInfo,
      permissions: localizedPermissions
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    req.flash("error_with_popup", req.t(
      req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.SYSTEM_USER,
      })
    );
    return res.redirect('/admin/users');
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
    const user = await User.findOne(filter).populate('user_profile').populate('address');
    if (!user) {
      req.flash("error_with_popup", req.t(
        req.trans.messages.not_found, {
          attribute: req.trans.cruds.MODULE.SYSTEM_USER, 
        })
      );
      return res.redirect('/admin/users');
    }
    const roles = await Role.find({
      isDeleted: false,
      deletedAt: null,
    });

    // const upload = await Upload.findOne({ uploadsable_id: user._id, uploadsable_type: 'User' }).sort({ createdAt: -1 });
    const upload = user.user_profile;
    const profileImageUrl = upload ? '/' + upload.file_path : null;
    return res.render("backend/system-users/edit", {
      roles: roles,
      user: user,
      profileImageUrl: profileImageUrl,
    });
  } catch (error) {
    req.flash("error_with_popup", req.t(
      req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.SYSTEM_USER, 
      })
    );
    return res.redirect('/admin/users');
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
      const userId= req.params.id;
      const filter ={
        _id:userId,
        isDeleted:false
      };
      const user= await User.findOne(filter).populate("address").populate("user_profile");
  
      if (!user) {
        return res.status(400).json(errorResponse(
          req.t(req.trans.messages.not_found, {
            attribute : req.trans.cruds.MODULE.SYSTEM_USER
          })
        ));
      }
       const userData = {
        first_name: req.body.first_name,
        middle_name: req.body.middle_name,
        last_name: req.body.last_name,
        username: req.body.username,
        email: req.body.email,
        country_code: req.body.country_code,
        phone_number: req.body.phone_number,
        role_id: req.body.role,
        createdBy: req.user._id
      };
      if (req.body.password) {
        userData.password = await bcrypt.hash(req.body.password, 10);
      }
        const userUpdate = await User.findByIdAndUpdate(userId, userData, { new: true });
       const address={
        building_name:req.body.building_name,
        street:req.body.street,
        area:req.body.area,
        city:req.body.city,
        postal_code:req.body.postal_code,
        country:req.body.country
       };
     
       await Address.findOneAndUpdate(user.address._id,address,{new:true});
      let fileMetadata = null;
      if (req.file) {
        const isS3 = !!process.env.AWS_SDK_API_KEY && !!process.env.AWS_SDK_API_SECRET_KEY;
        fileMetadata = await saveUpload(userUpdate._id, 'User', req.file, isS3);
      }

      const url = req.body.update_continue == 1 ? `/admin/user/${userId}/edit` : '/admin/users';
      return res.status(201).json(successResponse(
        req.t(req.trans.messages.update_success_message, {
          attribute : req.trans.cruds.USER.title_singular
        }), { userUpdate,
      }, null, null, url));
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json(internalServerErrorResponse(
          req.t(req.trans.messages.oops_something_went_wrong, {
            attribute: req.trans.cruds.MODULE.SYSTEM_USER,
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
            attribute : req.trans.cruds.MODULE.SYSTEM_USER
          })
        ));
      }

      await user.softDelete(req.user._id);
      return res.json(successResponse(
        req.t(req.trans.messages.delete_success_message, {
        attribute : req.trans.cruds.USER.title_singular
      }), { id }));
  } catch (error) {
      console.error('Error deleting user:', error);
      return res.status(500).json(internalServerErrorResponse(
        req.t(req.trans.messages.oops_something_went_wrong, {
          attribute: req.trans.cruds.MODULE.SYSTEM_USER,
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
      return res.status(400).json(
        errorResponse(
          req.t(req.trans.messages.invalid_key, {
            attribute: req.trans.cruds.USER.fields.status,
          })
        )
      );
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
      if(user.account_type == 'system_user'){
        await user.setWorkingDays(365);
      }
    } else if (status === 'inactive') {
      await user.suspendUser();
    }

    return res.status(200).json(
      successResponse(
        req.t(req.trans.messages.key_update, {
          attribute: req.trans.cruds.MODULE.SYSTEM_USER,
          status: status,
        }),
        {}, null, null, null
      )
    );
  } catch (error) {
    console.error('Error while updating user status:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.SYSTEM_USER
      })
    ));
  }
}

/* 
** Resend Credential
*/
async function resendCredential(req, res) {
  try {
    const { id } = req.params;

    const user = await User.findOne({ _id: id, isDeleted: false });
    if (!user) {
      return res.status(400).json(errorResponse(
        req.t(req.trans.messages.not_found, {
          attribute: req.trans.cruds.MODULE.SYSTEM_USER
        })
      ));
    }

    await user.sendCredentials();
    return res.status(200).json(successResponse(req.trans.messages.credentials_resent_successfully));
  } catch (error) {
    console.error('Resend credentials error:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.SYSTEM_USER,
      })
    ));
  }
}

/* 
** Add Working days for system users..
*/
async function assignWorkingDays(req, res) {
  try {
    const { workingDate } = req.body;
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json(
        errorResponse(
          req.t(req.trans.messages.not_found, {
            attribute: req.trans.cruds.MODULE.SYSTEM_USER,
          })
        )
      );
    }

    const selectedDate = new Date(workingDate);
    const today = new Date();
    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffInTime = selectedDate - today;
    const numberOfDays = diffInTime / (1000 * 3600 * 24);

    if (numberOfDays < 0) {
      return res.status(400).json(
        errorResponse(
          req.t(req.trans.validation.invalid_last_working_date)
        )
      );
    }

    await user.setWorkingDays(numberOfDays);
    return res.status(200).json(
      successResponse(
        req.t(req.trans.messages.key_update, {
          attribute: req.trans.cruds.USER.fields.last_working_date,
          status: workingDate,
        })
      )
    );
  } catch (error) {
    console.error('Error while assigning working days:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.SYSTEM_USER
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
    resendCredential,
    assignWorkingDays
};