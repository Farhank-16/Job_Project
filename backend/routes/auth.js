const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { otpLimiter, loginLimiter } = require("../middleware/rateLimit");

router.post("/request-otp", otpLimiter, auth.requestOTP);
router.post("/verify-otp", loginLimiter, auth.verifyOTPAndLogin);
router.post("/resend-otp", otpLimiter, auth.resendOTP);
router.get("/me", authenticate, auth.getCurrentUser);
router.post("/logout", auth.logout); // No auth — logout must always succeed

module.exports = router;
