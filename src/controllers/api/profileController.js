const Role = require("../../models/role");
const User = require("../../models/user");
const Address = require("../../models/address");
const Upload = require("../../models/upload");
const { editProfileRequest, editProfilePasswordRequest } = require('../../requests/api/profileRequest');
const bcrypt = require('bcryptjs');
const blacklist = require('../../config/blacklist');
const {
  saveUpload
} = require('../../utils/saveUpload');

const { 
    deleteFileIfExistsUsingName 
} = require("../../utils/helper");

const {
  successResponse,
  errorResponse,
  internalServerErrorResponse,
} = require('../../utils/apiResponses');
/**
 * Show a user profile 
 */
async function profile(req, res) {
    try {
        const user = req.user;
        const data = await User.findOne({
            _id: user._id
        }).populate({
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
        }).populate('profile').populate('user_profile').populate({
            path: 'address',
            populate: [
                { path: 'country', select: '_id name' },
                { path: 'state', select: '_id name' },
                { path: 'city', select: '_id name' }
            ]
        });
        
        return res.json(successResponse(
            req.t(req.trans.messages.fetch_success_message, {
                attribute: req.trans.cruds.MODULE.PROFILE
            }), {
                success_type: 'PROFILE_FETCH',
                data, 
            }, null, null, null
        ));
    } catch (error) {
        console.error('Error in the profile controller api: ', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.PROFILE,
            }),
            { error_type: 'INTERNAL_SERVER_ERROR' }
        ));
    }
}

/* 
** profileImage update
*/
async function profileFileUpdate(req, res){
    try{
        const userId = req.user.id;
        const filter ={
            _id:userId,
            isDeleted:false
        };
        const user = await User.findOne(filter).populate('profile');
        if (!user) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute : req.trans.cruds.MODULE.PROFILE
                }),
                { error_type: 'USER_NOT_FOUND' }
            ));
        }

        let fileMetadata = null;
        if (req.file) {
            if(user?.profile){
                await deleteFileIfExistsUsingName(user?.profile?.file_path);
                const uploadData = await Upload.findOne({ 
                    uploadsable_id: userId,
                    uploadsable_type: 'Profile',
                    type: 'profile_image',
                    file_path: user?.profile?.file_path
                });

                await uploadData.softDelete();
            } 
            const isS3 = !!process.env.AWS_SDK_API_KEY && !!process.env.AWS_SDK_API_SECRET_KEY;
            fileMetadata = await saveUpload(user._id, 'Profile', req.file, 'profile_image', isS3);
        }
        const data = fileMetadata;
        return res.status(200).json(successResponse(
            req.t(req.trans.messages.update_success_message, {
                attribute : req.trans.cruds.MODULE.PROFILE
            }), {
                success_type: 'PROFILE_FILE_UPDATE',
                data,
        }, null, null, null));
    } catch(err){
        console.error('Error in the profile controller api update: ', err);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.PROFILE,
            }),
            { error_type: 'INTERNAL_SERVER_ERROR' }
        ));
    }
}


/* 
* Edit User Profile
*/
async function profileUpdate(req, res) {
    try {
        const validationErrors = await editProfileRequest(req);
        if (validationErrors) {
            return res.status(422).json(errorResponse(req.trans.auth.validation_error, {
                error_type: 'VALIDATION_ERROR', 
                ...validationErrors
            }));

        }
        
        const { 
            first_name, 
            middle_name, 
            last_name, 
            username, 
            email, 
            country_code,
            phone_number,
            address_line_1,
            address_line_2,
            city,
            state,
            country,
            postal_code,
            alternate_country_code,
            alternate_address_contact_number,
        } = req.body;

        const userId = req.user.id;
        const filter ={
            _id:userId,
            isDeleted:false
        };
        const user = await User.findOne(filter).populate({
            path: 'address',
            populate: ['country', 'state', 'city']
        });

        if (!user) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute : req.trans.cruds.MODULE.PROFILE
                }),
                { error_type: 'USER_NOT_FOUND' }
            ));
        }

        let updateData = {
            first_name,
            middle_name, 
            last_name, 
            username: username || user.username, 
            email: email || user.email,
            country_code,
            phone_number: phone_number || user.phone_number, 
        }
        
        const updating = await User.findByIdAndUpdate(userId, updateData, { new: true });

        const addressData = {
            userId,
            address_line_1,
            address_line_2,
            city,
            state,
            country,
            postal_code,
            country_code: alternate_country_code,
            contact_number: alternate_address_contact_number,
            address_type: 'profile'
        }

        let updatingAddress = null;
        if(user?.address?._id){
            updatingAddress = await Address.findByIdAndUpdate(
                user.address._id, 
                addressData, 
                { new: true }
            )
            .populate([
            { path: 'country', select: '_id name' },
            { path: 'state', select: '_id name' },
            { path: 'city', select: '_id name' }
            ]);
        } else {
            updatingAddress = await Address.create(addressData);
            updatingAddress = await Address.findById(updatingAddress._id)
            .populate([
                { path: 'country', select: '_id name' },
                { path: 'state', select: '_id name' },
                { path: 'city', select: '_id name' }
            ]);
        }

        const cleanUserData = {
            _id: user._id,
            first_name: user.first_name,
            middle_name: user.middle_name,
            last_name: user.last_name,
            username: user.username,
            email: user.email,
            country_code: user.country_code,
            phone_number: user.phone_number,
        };
        const data = {
            ...cleanUserData,
            ...updatingAddress.toObject()
        };


        return res.status(200).json(successResponse(
            req.t(req.trans.messages.update_success_message, {
                attribute : req.trans.cruds.MODULE.PROFILE
            }), { 
            success_type: 'PROFILE_DETAIL_UPDATE',
            data
        }, null, null, null));
    } catch (error) {
        console.error('Error in the profile controller api update: ', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.PROFILE,
            }),
            { error_type: 'INTERNAL_SERVER_ERROR' }
        ));
    }
}

/*
* profile password update
*/
async function profilePasswordUpdate(req, res) {
    try {
        const validationErrors = await editProfilePasswordRequest(req);
        if (validationErrors) {
            return res.status(422).json(errorResponse(req.trans.auth.validation_error, {
                    error_type: 'VALIDATION_ERROR', ...validationErrors
                })
            );
        }

        const { password } = req.body;
        const userId = req.user._id;

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(userId, { password: hashedPassword });

        return res.status(200).json(successResponse(
            req.t(req.trans.messages.update_success_message, {
                attribute: req.trans.cruds.MODULE.PROFILE
            })
        ));
    } catch (error) {
        console.error('Error in the profile controller password update: ', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.PROFILE,
            }),
            { error_type: 'INTERNAL_SERVER_ERROR' }
        ));
    }
}


/* 
** Profile delete..
*/
async function profileDelete(req, res){
    try {
        const userId = req.user.id;
        const filter = {
            isDeleted: false,
            _id: userId
        };
        const user = await User.findOne(filter);
        await user.softDelete(userId);

        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(400).json(errorResponse(req.trans.auth.noToken, { error_type: 'NO_TOKEN' }));
    
        blacklist.revoke(token);
        if (req.session.currentToken) {
            req.session.currentToken = null;
        }

        return res.status(200).json(successResponse(
            req.t(req.trans.messages.delete_success_message, {
                attribute : req.trans.cruds.MODULE.PROFILE
            }), { 
                success_type: 'ACCOUNT_DELETE',
                deleted: user.isDeleted,
        }, null, null, null));
    } catch (error) {
        console.error('Error in the profile controller delete api: ', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.PROFILE,
            }),
            { error_type: 'INTERNAL_SERVER_ERROR' }
        ));
    }
} 

module.exports = {
    profile,
    profileFileUpdate,
    profileUpdate,
    profilePasswordUpdate,
    profileDelete
};