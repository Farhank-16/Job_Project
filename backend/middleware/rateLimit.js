const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for OTP requests
 */
const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // 3 requests per minute
  message: {
    error: 'Too many OTP requests',
    message: 'Please wait before requesting another OTP',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for login attempts
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: {
    error: 'Too many login attempts',
    message: 'Please try again after 15 minutes',
  },
});

/**
 * Rate limiter for API requests
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    error: 'Rate limit exceeded',
    message: 'Too many requests, please slow down',
  },
});

/**
 * Rate limiter for payment requests
 */
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    error: 'Too many payment requests',
    message: 'Please wait before trying again',
  },
});

module.exports = {
  otpLimiter,
  loginLimiter,
  apiLimiter,
  paymentLimiter,
};