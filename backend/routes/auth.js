const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { otpLimiter, loginLimiter } = require('../middleware/rateLimit');

// Request OTP
router.post('/request-otp', otpLimiter, authController.requestOTP);

// Verify OTP and login/register
router.post('/verify-otp', loginLimiter, authController.verifyOTPAndLogin);

// Resend OTP
router.post('/resend-otp', otpLimiter, authController.resendOTP);

// Get current user (protected)
router.get('/me', authenticate, authController.getCurrentUser);

// FIX: Logout should NOT require authenticate middleware.
// If token is expired and user tries to logout:
// 1. authenticate returns 401
// 2. api.js interceptor sees 401 on a non-/auth/ route... wait it IS /auth/
// But the real issue: logout should always succeed regardless of token state.
router.post('/logout', authController.logout);

module.exports = router;