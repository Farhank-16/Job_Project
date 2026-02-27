const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const hashOTP = async (otp) => bcrypt.hash(otp, await bcrypt.genSalt(10));

const verifyOTP = async (otp, hash) => bcrypt.compare(otp, hash);

const getOTPExpiry = (minutes = 5) => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
};

module.exports = { generateOTP, hashOTP, verifyOTP, getOTPExpiry };