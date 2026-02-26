const rateLimit = require('express-rate-limit');

const make = (windowMs, max, error) => rateLimit({
  windowMs, max,
  message:        { error },
  standardHeaders: true,
  legacyHeaders:   false,
});

const otpLimiter     = make(60 * 1000,       3,   'Too many OTP requests. Please wait a minute.');
const loginLimiter   = make(15 * 60 * 1000,  10,  'Too many login attempts. Please try after 15 minutes.');
const apiLimiter     = make(15 * 60 * 1000,  200, 'Too many requests. Please slow down.');
const paymentLimiter = make(60 * 1000,       5,   'Too many payment requests. Please wait before trying again.');

module.exports = { otpLimiter, loginLimiter, apiLimiter, paymentLimiter };