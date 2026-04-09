const express = require('express');
const router = express.Router();

// Middleware
const authenticate = require('../../middleware/auth/web/authenticate');
const isNotAuthenticated = require('../../middleware/auth/web/isNotAuthenticated');

// Controllers
const authController = require('../../controllers/backend/auth/authController');

// Auth Routes
router.get('/', isNotAuthenticated, (req, res) => {
  res.render('auth/login', { layout: 'layouts/authLayout' });
});
router.get('/login', isNotAuthenticated, (req, res) => {
  res.render('auth/login', { layout: 'layouts/authLayout' });
});
router.post('/login', isNotAuthenticated, authController.login);

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

module.exports = router;