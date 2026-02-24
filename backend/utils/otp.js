const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Hash OTP before storing
 */
const hashOTP = async (otp) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
};

/**
 * Verify OTP against hash
 */
const verifyOTP = async (otp, hash) => {
  return bcrypt.compare(otp, hash);
};

/**
 * Calculate OTP expiry time
 */
const getOTPExpiry = (minutes = 5) => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
};

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTP,
  getOTPExpiry,
};