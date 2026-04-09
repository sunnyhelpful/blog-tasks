const Role = require("../../models/role");
const User = require("../../models/user");
const Address= require("../../models/address");
const { editProfileRequest } = require('../../requests/backend/profileRequest');
const bcrypt = require('bcryptjs');
const {
  saveUpload
} = require('../../utils/saveUpload');
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
        const userData = await User.findOne({
            _id: req.user.id
        }).populate({
            path: 'role_id',
            populate: {
                path: 'role_permissions',
                select: 'permission_id',
                match: { isDeleted: false },
                populate: {
                    path: 'fetch_permissions',
                    select: { name: 1, title: 1 }
                }
            }
        }).populate('profile').populate('user_profile').populate('address');

        const lang = req.session.lang || 'en';

        const localizedPermissions = userData.role_id.role_permissions.map(rp => {
            const permission = rp.fetch_permissions;
            return {
                name: permission?.name || '',
                title: permission?.title?.get(lang) || permission?.title?.get('en') || '',
            };
        });

        return res.render("backend/profile/profile", {
            userData,
            permissions: localizedPermissions
        });
    } catch (error) {
        console.error(error);
        return res.status(500).render('common/pages/page-500', { 
            layout: 'layouts/pageLayout',
            message: 'Something went wrong while fetching data.' 
        });
    }
}

/* 
* Edit User Profile
*/
async function profileUpdate(req, res) {
    try {
        const validationErrors = await editProfileRequest(req);
        if (validationErrors) {
            return res.status(400).json(errorResponse(req.trans.messages.validation_error, validationErrors));
        }
        const { 
            first_name, 
            middle_name, 
            last_name, 
            username, 
            email,  
            country_code,
            phone_number, 
            password          
        } = req.body;
      
        const userId = req.user.id;
        const filter ={
            _id:userId,
            isDeleted:false
        };
        const user= await User.findOne(filter).populate("address").populate("user_profile");
          
        if (!user) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                attribute : req.trans.cruds.MODULE.PROFILE
                })
            ));
        }

        let updateData = {
            first_name,
            middle_name, 
            last_name, 
            username, 
            email, 
            country_code,
            phone_number, 
        }

        if (req.body.password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        
        const updating = await User.findByIdAndUpdate(userId, updateData, { new: true })

        const addressData ={ 
            userId:user._id,
            building_name:req.body.building_name,
            street:req.body.street,
            area:req.body.area,
            city:req.body.city,
            postal_code:req.body.postal_code,
            country:req.body.country
        }

        if(user?.address?._id){
            await Address.findOneAndUpdate(user.address._id, addressData, {new:true});      
        } else {
            await Address.create(addressData);
        }

        const message = req.t(req.trans.messages.update_success_message, {
            attribute : req.trans.cruds.MODULE.PROFILE
        });
        return res.status(201).json(successResponse(message, {
            updating,
        }, null, null, '/admin/profile'));
    } catch (error) {
        console.error(error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.PROFILE,
            })
        ));
    }
}

async function profileFileUpdate(req, res) {
    try {
        const userId = req.user.id;
        const filter ={
            _id:userId,
            isDeleted:false
        };
        const user= await User.findOne(filter).populate("user_profile");
        if (!user) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                attribute : req.trans.cruds.MODULE.PROFILE
                })
            ));
        }
        let fileMetadata = null;
        if (req.file) {
            const isS3 = !!process.env.AWS_SDK_API_KEY && !!process.env.AWS_SDK_API_SECRET_KEY;
            fileMetadata = await saveUpload(userId, 'Profile', req.file, 'profile_image', isS3);
        }

        return res.status(201).json(
        successResponse(req.t(req.trans.messages.update_success_message, {
            attribute : req.trans.cruds.MODULE.PROFILE
        }), { }, null, null, '/admin/profile'));
    } catch (error) {
        console.error("Error...", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.PROFILE,
            })
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

        res.clearCookie('token');
        res.clearCookie('refreshToken');
        if (req.session.currentToken) {
            req.session.currentToken = null;
        }

        return res.status(200).json(successResponse(
            req.t(req.trans.messages.delete_success_message, {
                attribute : req.trans.cruds.MODULE.PROFILE
            }), { user,
        }, null, null, '/'));
    } catch (error) {
        console.error('Error in the profile controller delete api: ', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.PROFILE,
            })
        ));
    }
}

module.exports = {
    profile,
    profileUpdate,
    profileFileUpdate,
    profileDelete,
};