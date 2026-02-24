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

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// Logout
router.post('/logout', authenticate, authController.logout);

module.exports = router;