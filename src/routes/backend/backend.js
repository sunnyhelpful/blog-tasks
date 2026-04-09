const express = require("express");
const router = express.Router();

// Middleware
const authenticate = require("../../middleware/auth/web/authenticate");
const isNotAuthenticated = require("../../middleware/auth/web/isNotAuthenticated");
const routeLimiter = require("../../middleware/rateLimiter");
const blogController = require("../../controllers/backend/blogController");

const { uploadFile } = require("../../utils/uploadFile");

// Controllers
const authController = require("../../controllers/backend/auth/authController");
const dashboardController = require("../../controllers/backend/dashboardController");

// Auth Routes
router.get("/login", routeLimiter, isNotAuthenticated, (req, res) => {
  res.render("auth/login", { layout: "layouts/authLayout" });
});
router.post("/login", routeLimiter, isNotAuthenticated, authController.login);

router.get("/verify-otp/:id", isNotAuthenticated, (req, res) => {
  res.render("auth/verify-otp", { layout: "layouts/authLayout" });
});
router.post("/verify-otp", isNotAuthenticated, authController.verifyOtp);
router.get(
  "/resend-verification/:userid",
  authController.resendVerificationOtp,
);

router.get("/forgot-password", isNotAuthenticated, (req, res) => {
  res.render("auth/forgot-password", { layout: "layouts/authLayout" });
});
router.post(
  "/forgot-password",
  isNotAuthenticated,
  authController.forgotPassword,
);

router.get(
  "/reset-password",
  isNotAuthenticated,
  authController.showResetPasswordPage,
);
router.post("/reset-password", authController.resetPassword);

router.get("/logout", authenticate, authController.logout);

// Protected Routes
router.get("/dashboard", authenticate, dashboardController.dashboard);

router.get("/blogs/", blogController.index);

router.post("/blogs/", uploadFile("blogImages"), blogController.store);

router.get("/blogs/:id", blogController.show);

router.get("/:id/edit", blogController.edit);

router.put("/blogs/:id", uploadFile("blogImages"), blogController.update);

router.delete("/blogs/:id", blogController.delete);

module.exports = router;
