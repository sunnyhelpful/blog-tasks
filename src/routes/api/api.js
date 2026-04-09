const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/auth/api/authenticate');
const isNotAuthenticated = require('../../middleware/auth/api/isNotAuthenticated');

const handleMulterError = require('../../middleware/handleMulterError');

/* file upload */
const { uploadFile, multiUploadFiles } = require('../../utils/uploadFile');


const authController = require('../../controllers/api/auth/authController');
const socialLoginController = require('../../controllers/api/auth/socialLoginController');

const settingController = require('../../controllers/api/settingController');
const translatorController = require('../../controllers/api/translatorController');

const profileController = require('../../controllers/api/profileController');
const worldController = require('../../controllers/api/worldController');
const announcementController = require('../../controllers/api/announcementController');
const brandController = require('../../controllers/api/brandController');
const categoryTypeController = require('../../controllers/api/categoryTypeController');
const categoryController = require('../../controllers/api/categoryController');
const requestProductController = require('../../controllers/api/requestProductController');
const postListController = require('../../controllers/api/postListController');


router.post('/login', isNotAuthenticated, authController.login);
router.post('/register', isNotAuthenticated, authController.register);
router.post('/verify-email', isNotAuthenticated, authController.verifyEmail);
router.post('/resend-verification-email', isNotAuthenticated, authController.resendVerificationOtp);
router.post('/forgot-password', isNotAuthenticated, authController.forgotPassword);
router.post('/reset-password', isNotAuthenticated, authController.resetPassword);

router.post('/refresh-token', authenticate, authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

router.post('/social-login', isNotAuthenticated, socialLoginController.socialLogin);

/* Global Apis */

/* translator */
router.post('/translator', translatorController.translator);

/* Protected Apis */
/* Home */
// router.get('/dashboard', authenticate, dashboardController.dashboard);

/* Settings */
router.get('/settings', settingController.index);
router.get('/setting/:id_or_slug', settingController.show);

/* Profile */
router.get('/profile', authenticate, profileController.profile);
router.post('/profile/file', authenticate, uploadFile('profile', 'image', 'profile', 5, 1), handleMulterError(5), profileController.profileFileUpdate);
router.post('/profile', authenticate, profileController.profileUpdate);
router.post('/profile-password', authenticate, profileController.profilePasswordUpdate);
router.delete('/profile', authenticate, profileController.profileDelete);

/* world regions */
router.get('/regions', authenticate, worldController.regions);
router.get('/subregions', authenticate, worldController.subregions);
router.get('/countries', authenticate, worldController.countries);
router.get('/states', authenticate, worldController.states);
router.get('/cities', authenticate, worldController.cities);

/* categories type */
router.get('/categories-type', authenticate, categoryTypeController.index);
router.get('/category-type/:id_or_slug', authenticate, categoryTypeController.show);

/* categories */
router.get('/categories', authenticate, categoryController.index);
router.get('/category/:id_or_slug', authenticate, categoryController.show);

/* Announcements */
router.get('/announcements', authenticate, announcementController.index);
router.get('/announcement/:id_or_slug', authenticate, announcementController.show);

/* Brands */
router.get('/brands', authenticate, brandController.index);
router.get('/brand/:id_or_slug', authenticate, brandController.show);

/* For Request Products */
router.post('/request-product/create', authenticate, requestProductController.create);

/* Post List */
router.get('/fetch-form-builder', authenticate, postListController.fetchProductFormConfig);

module.exports = router;