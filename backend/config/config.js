require('dotenv').config();

module.exports = {
  port:    process.env.PORT     || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  db: {
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'rural_job_platform',
    port:     process.env.DB_PORT     || 3306,
  },

  jwt: {
    secret:    process.env.JWT_SECRET     || 'change_this_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  msg91: {
    authKey:    process.env.MSG91_AUTH_KEY,
    senderId:   process.env.MSG91_SENDER_ID  || 'JOBNEST',
    templateId: process.env.MSG91_TEMPLATE_ID,
    route:      process.env.MSG91_ROUTE      || '4',
  },

  razorpay: {
    keyId:     process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },

  // Prices in paise (e.g., 900 = ₹9.00)
  prices: {
    subscriptionFirstMonth: parseInt(process.env.SUBSCRIPTION_FIRST_MONTH) || 900,
    subscriptionRegular:    parseInt(process.env.SUBSCRIPTION_REGULAR)     || 9900,
    skillExam:              parseInt(process.env.SKILL_EXAM_PRICE)         || 4900,
    verifiedBadge:          parseInt(process.env.VERIFIED_BADGE_PRICE)     || 9900,
  },

  otp: {
    maxAttempts:   parseInt(process.env.OTP_MAX_ATTEMPTS)    || 3,
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES)  || 5,
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};