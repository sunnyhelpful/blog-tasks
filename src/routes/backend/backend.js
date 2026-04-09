const express = require('express');
const router = express.Router();

// Middleware
const authenticate = require('../../middleware/auth/web/authenticate');
const isNotAuthenticated = require('../../middleware/auth/web/isNotAuthenticated');
const authorizePermission = require('../../middleware/auth/web/authorizePermission');
const routeLimiter = require('../../middleware/rateLimiter');
const readExcelFile = require('../../middleware/readExcelFile');


const handleMulterError = require('../../middleware/handleMulterError');
/* file upload */
const { uploadFile, multiUploadFiles } = require('../../utils/uploadFile');
const multer = require('multer');
const uploadParser = multer().none();


// Controllers
const authController = require('../../controllers/backend/auth/authController');
const commonController = require('../../controllers/backend/commonController');
const dashboardController = require('../../controllers/backend/dashboardController');
const profileController = require('../../controllers/backend/profileController');
const notificationController = require('../../controllers/backend/notificationController');
const userController = require('../../controllers/backend/userController');
const platformuserController = require('../../controllers/backend/platformuserController');
const roleController = require('../../controllers/backend/roleController');
const attributeController = require('../../controllers/backend/attributeController');
const categoryTypeController = require('../../controllers/backend/categoryTypeController');
const categoryController = require('../../controllers/backend/categoryController');
const brandController = require('../../controllers/backend/brandController');
const tagController = require('../../controllers/backend/tagController');
const announcementController = require('../../controllers/backend/announcementController');
const tierController = require('../../controllers/backend/tierController');
const settingController = require('../../controllers/backend/settingController');
const logsController = require('../../controllers/backend/LogsController');

// Auth Routes
router.get('/login', routeLimiter, isNotAuthenticated, (req, res) => {
  res.render('auth/login', { layout: 'layouts/authLayout' });
});
router.post('/login', routeLimiter, isNotAuthenticated, authController.login);

router.get('/verify-otp/:id', isNotAuthenticated, (req, res) => {
  res.render('auth/verify-otp', { layout: 'layouts/authLayout' });
});
router.post('/verify-otp', isNotAuthenticated, authController.verifyOtp);
router.get('/resend-verification/:userid', authController.resendVerificationOtp);

router.get('/forgot-password', isNotAuthenticated, (req, res) => {
  res.render('auth/forgot-password', { layout: 'layouts/authLayout' });
});
router.post('/forgot-password', isNotAuthenticated, authController.forgotPassword);

router.get('/reset-password', isNotAuthenticated, authController.showResetPasswordPage);
router.post('/reset-password', authController.resetPassword);

router.get('/logout', authenticate, authController.logout);

/* Translator */
router.post('/translator', commonController.translator);
/* Dark-Mode-Session */
router.post('/dark-mode', commonController.templateMode);


// Protected Routes
router.get('/dashboard', authenticate, dashboardController.dashboard);

router.get('/profile', authenticate, authorizePermission(['access_profile']), profileController.profile);
router.post('/profile', authenticate, authorizePermission(['edit_profile']), profileController.profileUpdate);
router.post('/profile/file', authenticate, authorizePermission(['edit_profile']), uploadFile('profile', 'image', 'profile', 5, 1), handleMulterError(5), profileController.profileFileUpdate);
router.delete('/profile', authenticate, authorizePermission(['delete_profile']), profileController.profileDelete);


/* Notification */
router.get('/notifications', authenticate, authorizePermission(['access_notification']), notificationController.index);
router.get('/notification/:id', authenticate, authorizePermission(['view_notification']), notificationController.show);
router.delete('/notification/:id/delete', authenticate, authorizePermission(['delete_notification']), notificationController.destroy);
router.post('/notification/mark-read/:id', authenticate, authorizePermission(['mark_notification_read']),  notificationController.readNotification);

/* Logs */
router.get('/logs', authenticate, logsController.index);
router.get('/logs/clear', authenticate, logsController.clear);

/* User(System Users) */
router.get('/users', authenticate, authorizePermission(['access_system_user']), userController.index);
router.get('/user/create', authenticate, authorizePermission(['create_system_user']), userController.create);
router.post('/user/store', authenticate, authorizePermission(['create_system_user']), uploadFile('profile', 'image', 'user', 5, 1), handleMulterError(5), userController.store);
router.get('/user/:id', authenticate, authorizePermission(['view_system_user']), userController.show);
router.get('/user/:id/edit', authenticate, authorizePermission(['edit_system_user']), userController.edit);
router.post('/user/:id', authenticate, authorizePermission(['edit_system_user']), uploadFile('profile', 'image', 'user', 5, 1), handleMulterError(5), userController.update);
router.delete('/user/:id/delete', authenticate, authorizePermission(['delete_system_user']), userController.destroy);
router.post('/user/:id/update-status', authenticate, authorizePermission(['system_user_status']), userController.statusUpdate);
router.post('/user/:id/resend-mail', authenticate, authorizePermission(['resend_system_user_credential']), userController.resendCredential);
router.post('/user/:id/assign-working-day', authenticate, authorizePermission(['assign_system_user_last_working_days']), userController.assignWorkingDays);

/* (Platform Users) */
router.get('/platform-users', authenticate, authorizePermission(['access_platform_user']), platformuserController.index);
router.get('/platform-user/create', authenticate, authorizePermission(['create_platform_user']), platformuserController.create);
router.post('/platform-user/store', authenticate, authorizePermission(['create_platform_user']), uploadFile('profile', 'image', 'user', 5, 1), handleMulterError(5), platformuserController.store);
router.get('/platform-user/:id', authenticate, authorizePermission(['view_platform_user']), platformuserController.show);
router.get('/platform-user/:id/edit', authenticate, authorizePermission(['edit_platform_user']), platformuserController.edit);
router.post('/platform-user/:id', authenticate, authorizePermission(['edit_platform_user']), uploadFile('profile', 'image', 'user', 5, 1), handleMulterError(5), platformuserController.update);
router.delete('/platform-user/:id/delete', authenticate, authorizePermission(['delete_platform_user']), platformuserController.destroy);
router.post('/platform-user/:id/update-status', authenticate, authorizePermission(['platform_user_status']), platformuserController.statusUpdate);

/* role */
router.get('/roles', authenticate, authorizePermission(['access_role']), roleController.index);
router.get('/role/create', authenticate, authorizePermission(['create_role']), roleController.create);
router.post('/role/store', authenticate, authorizePermission(['create_role']), roleController.store);
router.get('/role/:id', authenticate, authorizePermission(['view_role']), roleController.show);
router.get('/role/:id/edit', authenticate, authorizePermission(['edit_role']), roleController.edit);
router.post('/role/:id', authenticate, authorizePermission(['edit_role']), roleController.update);
router.delete('/role/:id/delete', authenticate, authorizePermission(['delete_role']), roleController.destroy);

/* attributes */
router.get('/attributes', authenticate, authorizePermission(['access_attribute']), attributeController.index);
router.get('/attribute/create', authenticate, authorizePermission(['create_attribute']), attributeController.create);
// router.post('/attribute/store', authenticate, authorizePermission(['create_attribute']), attributeController.store);
router.post('/attribute/store', authenticate, authorizePermission(['create_attribute']),
    (req, res, next) => {
        const type = req.query.type;
        let upload;
        if ((type === 'radioimage') || (type === 'checkboximage') || (type === 'radioimagetitle') || (type === 'checkboximagetitle')) {
            upload = multiUploadFiles([
                { name: 'option_en[]', maxCount: 15 },
                { name: 'option_ar[]', maxCount: 15 }
            ], 'image', 'attributes', 100);
        } else {
            upload = multer().none();
        }
        upload(req, res, function (err) {
            if (err) return next(err);
            attributeController.store(req, res, next);
        });
    }
);
router.get('/attribute/:id', authenticate, authorizePermission(['view_attribute']), attributeController.show);
router.get('/attribute/:id/edit', authenticate, authorizePermission(['edit_attribute']), attributeController.edit);
// router.post('/attribute/:id', authenticate, authorizePermission(['edit_attribute']), attributeController.update);
router.post('/attribute/:id', authenticate, authorizePermission(['edit_attribute']),
    (req, res, next) => {
        const type = req.query.type;
        let upload;
        if ((type === 'radioimage') || (type === 'checkboximage') || (type === 'radioimagetitle') || (type === 'checkboximagetitle')) {
            upload = multiUploadFiles([
                { name: 'option_en[]', maxCount: 15 },
                { name: 'option_ar[]', maxCount: 15 }
            ], 'image', 'attributes', 100);
        } else {
            upload = multer().none();
        }
        upload(req, res, function (err) {
            if (err) return next(err);
            attributeController.update(req, res, next);
        });
    }
);
router.delete('/attribute/:id/delete', authenticate, authorizePermission(['delete_attribute']), attributeController.destroy);
router.post('/attribute/status-update/:id', authenticate, authorizePermission(['attribute_status']), attributeController.statusUpdate);

/* categories */
/* router.get('/categories-type', authenticate, authorizePermission(['access_category_type']), categoryTypeController.index);
router.get('/category-type/create', authenticate, authorizePermission(['create_category_type']), categoryTypeController.create);
router.post('/category-type/store', authenticate, authorizePermission(['create_category_type']), multiUploadFiles([
  { name: 'category_type_image', maxCount: 1 }, 
  { name: 'category_type_icon', maxCount: 1 } 
], 'image', 'categories-type', 5), handleMulterError(5), categoryTypeController.store);
router.get('/category-type/:id', authenticate, authorizePermission(['view_category_type']), categoryTypeController.show);
router.get('/category-type/:id/edit', authenticate, authorizePermission(['edit_category_type']), categoryTypeController.edit);
router.post('/category-type/:id', authenticate, authorizePermission(['edit_category_type']), multiUploadFiles([
  { name: 'category_type_image', maxCount: 1 }, 
  { name: 'category_type_icon', maxCount: 1 } 
], 'image', 'categories-type', 5), handleMulterError(5), categoryTypeController.update);
router.delete('/category-type/:id/delete', authenticate, authorizePermission(['delete_category_type']), categoryTypeController.destroy);
router.post('/category-type/status-update/:id', authenticate, authorizePermission(['category_type_status']), categoryTypeController.statusUpdate); */
// router.post('/category-type/imports', authenticate, authorizePermission(['category_type_import']), uploadFile('category_type_file', 'excel', 'documents', 50, 1), handleMulterError(50), readExcelFile, categoryTypeController.categoryTypeImport);


/* categories */
router.get('/categories', authenticate, authorizePermission(['access_category']), categoryController.index);
router.get('/category/create', authenticate, authorizePermission(['create_category']), categoryController.create);
router.post('/category/store', authenticate, authorizePermission(['create_category']), multiUploadFiles([
  { name: 'category_image', maxCount: 1 }, 
  { name: 'category_icon', maxCount: 1 } 
], 'image', 'categories', 5), handleMulterError(5), categoryController.store);
router.get('/category/:id', authenticate, authorizePermission(['view_category']), categoryController.show);
router.get('/category/:id/edit', authenticate, authorizePermission(['edit_category']), categoryController.edit);
router.post('/category/:id', authenticate, authorizePermission(['edit_category']), multiUploadFiles([
  { name: 'category_image', maxCount: 1 }, 
  { name: 'category_icon', maxCount: 1 } 
], 'image', 'categories', 5), handleMulterError(5), categoryController.update);
router.delete('/category/:id/delete', authenticate, authorizePermission(['delete_category']), categoryController.destroy);
router.post('/categories/status-update/:id', authenticate, authorizePermission(['category_status']), categoryController.statusUpdate);
router.post('/categories/verify-update/:id', authenticate, authorizePermission(['category_verification']), categoryController.verificationUpdate);
router.post('/categories/imports', authenticate, authorizePermission(['category_import']), uploadFile('category_file', 'excel', 'documents', 50, 1), handleMulterError(50), readExcelFile, categoryController.categoryImport);
router.get('/categories/:id/form-builder', authenticate, authorizePermission(['create_postform']), categoryController.createPostForm);
router.get('/categories/form-buidler/fetch-selected-attributes', authenticate, authorizePermission(['create_postform']), categoryController.fetchSelectedAttribute);
router.post('/categories/form-buidler-attribute/:id/store', authenticate, authorizePermission(['create_postform']), categoryController.storeSelectedAttribute);

/* Brands */
router.get('/brands', authenticate, authorizePermission(['access_brand']), brandController.index);
router.get('/brand/create', authenticate, authorizePermission(['create_brand']), brandController.create);
router.post('/brand/store', authenticate, authorizePermission(['create_brand']), multiUploadFiles([
  { name: 'brand_image', maxCount: 1 }, 
  { name: 'brand_icon', maxCount: 1 } 
], 'image', 'brands', 5), handleMulterError(5), brandController.store);
router.get('/brand/:id', authenticate, authorizePermission(['view_brand']), brandController.show);
router.get('/brand/:id/edit', authenticate, authorizePermission(['edit_brand']), brandController.edit);
router.post('/brand/:id', authenticate, authorizePermission(['edit_brand']), multiUploadFiles([
  { name: 'brand_image', maxCount: 1 }, 
  { name: 'brand_icon', maxCount: 1 } 
], 'image', 'brands', 5), handleMulterError(5), brandController.update);
router.delete('/brand/:id/delete', authenticate, authorizePermission(['delete_brand']), brandController.destroy);
router.post('/brand/status-update/:id', authenticate, authorizePermission(['brand_status']), brandController.statusUpdate);
router.post('/brand/verify-update/:id', authenticate, authorizePermission(['brand_verification']), brandController.verificationUpdate);
// router.post('/brands/import', authenticate, authorizePermission(['brand_import']), uploadFile('brand_file', 'excel', 'documents', 50, 1), handleMulterError(50), readExcelFile, brandController.categoryImport);


/* Tags */
router.get('/tags', authenticate, authorizePermission(['access_tag']), tagController.index);
router.get('/tag/create', authenticate, authorizePermission(['create_tag']), tagController.create);
router.post('/tag/store', authenticate, authorizePermission(['create_tag']), multiUploadFiles([
  { name: 'tag_image', maxCount: 1 }, 
  { name: 'tag_icon', maxCount: 1 } 
], 'image', 'tags', 5), handleMulterError(5), tagController.store);
router.get('/tag/:id', authenticate, authorizePermission(['view_brand']), tagController.show);
router.get('/tag/:id/edit', authenticate, authorizePermission(['edit_tag']), tagController.edit);
router.post('/tag/:id', authenticate, authorizePermission(['edit_tag']), multiUploadFiles([
  { name: 'tag_image', maxCount: 1 }, 
  { name: 'tag_icon', maxCount: 1 } 
], 'image', 'tags', 5), handleMulterError(5), tagController.update);
router.delete('/tag/:id/delete', authenticate, authorizePermission(['delete_tag']), tagController.destroy);
router.post('/tag/status-update/:id', authenticate, authorizePermission(['tag_status']), tagController.statusUpdate);

/*  */
router.get('/announcements', authenticate, authorizePermission(['access_announcement']), announcementController.index);
router.get('/announcement/create', authenticate, authorizePermission(['create_announcement']), announcementController.create);
router.post('/announcement/store', authenticate, authorizePermission(['create_announcement']), announcementController.store);
router.get('/announcement/:id', authenticate, authorizePermission(['view_announcement']), announcementController.show);
router.get('/announcement/:id/edit', authenticate, authorizePermission(['edit_announcement']), announcementController.edit);
router.post('/announcement/:id', authenticate, authorizePermission(['edit_announcement']), announcementController.update);
router.delete('/announcement/:id/delete', authenticate, authorizePermission(['delete_announcement']), announcementController.destroy);
router.post('/announcement/status-update/:id', authenticate, authorizePermission(['announcement_status']), announcementController.statusUpdate);

/* Tiers */
router.get('/tiers', authenticate, authorizePermission(['access_tier']), tierController.index);
router.get('/tier/create', authenticate, authorizePermission(['create_tier']), tierController.create);
router.post('/tier/store', authenticate, authorizePermission(['create_tier']), tierController.store);
router.get('/tier/:id', authenticate, authorizePermission(['view_tier']), tierController.show);
router.get('/tier/:id/edit', authenticate, authorizePermission(['edit_tier']), tierController.edit);
router.post('/tier/:id', authenticate, authorizePermission(['edit_tier']), tierController.update);
router.delete('/tier/:id/delete', authenticate, authorizePermission(['delete_tier']), tierController.destroy);
router.post('/tier/status-update/:id', authenticate, authorizePermission(['tier_status']), tierController.statusUpdate);


/* For Settings */
router.get('/settings', authenticate, authorizePermission(['access_setting']), settingController.index);
// router.get('/setting/create', authenticate, authorizePermission(['create_setting']), settingController.create);
router.post('/setting/store', authenticate, authorizePermission(['create_setting']), uploadFile('value', 'image', 'settings', 5, 1), handleMulterError(5), settingController.store);
router.get('/setting/edit/:id', authenticate, authorizePermission(['edit_setting']), settingController.edit);
router.post('/setting/update/:id', authenticate, authorizePermission(['edit_setting']), uploadFile('value', 'image', 'settings', 5, 1), handleMulterError(5), settingController.update);
router.delete('/setting/delete/:id', authenticate, authorizePermission(['delete_setting']), settingController.destroy);
router.post('/setting/status-update/:id', authenticate, authorizePermission(['edit_setting']),  settingController.statusUpdate);


module.exports = router;