const db = require('../config/database');
const config = require('../config/config');
const msg91Service = require('../services/msg91');
const { generateOTP, hashOTP, verifyOTP, getOTPExpiry } = require('../utils/otp');
const { formatMobile, isValidMobile } = require('../utils/helpers');
const { generateToken } = require('../middleware/auth');

const requestOTP = async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile || !isValidMobile(mobile)) {
      return res.status(400).json({ error: 'Valid mobile number required' });
    }

    const formattedMobile = formatMobile(mobile);

    const [recentOTPs] = await db.execute(
      `SELECT COUNT(*) as count FROM otp_verifications 
       WHERE mobile = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      [formattedMobile]
    );

    if (recentOTPs[0].count >= config.otp.maxAttempts) {
      return res.status(429).json({ error: 'Too many OTP requests. Please try after an hour.' });
    }

    const otp       = generateOTP();
    const otpHash   = await hashOTP(otp);
    const expiresAt = getOTPExpiry(config.otp.expiryMinutes);

    await db.execute('DELETE FROM otp_verifications WHERE mobile = ?', [formattedMobile]);
    await db.execute(
      `INSERT INTO otp_verifications (mobile, otp_hash, expires_at) VALUES (?, ?, ?)`,
      [formattedMobile, otpHash, expiresAt]
    );

    await msg91Service.sendOTP(formattedMobile, otp);

    const [users] = await db.execute('SELECT id FROM users WHERE mobile = ?', [formattedMobile]);

    res.json({
      success:   true,
      message:   'OTP sent successfully',
      isNewUser: users.length === 0,
      ...(config.nodeEnv === 'development' && { otp }),
    });
  } catch (error) {
    console.error('Request OTP Error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

const verifyOTPAndLogin = async (req, res) => {
  try {
    const { mobile, otp, name, role } = req.body;
    if (!mobile || !otp) return res.status(400).json({ error: 'Mobile and OTP required' });

    const formattedMobile = formatMobile(mobile);

    const [otpRecords] = await db.execute(
      `SELECT * FROM otp_verifications 
       WHERE mobile = ? AND is_verified = FALSE 
       ORDER BY created_at DESC LIMIT 1`,
      [formattedMobile]
    );

    if (!otpRecords.length) return res.status(400).json({ error: 'No OTP found. Please request a new one.' });

    const otpRecord = otpRecords[0];

    if (new Date(otpRecord.expires_at) < new Date()) {
      return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }
    if (otpRecord.attempts >= 3) {
      return res.status(400).json({ error: 'Too many attempts. Please request a new OTP.' });
    }

    const isValid = await verifyOTP(otp, otpRecord.otp_hash);
    if (!isValid) {
      await db.execute('UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?', [otpRecord.id]);
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    await db.execute('UPDATE otp_verifications SET is_verified = TRUE WHERE id = ?', [otpRecord.id]);

    const [users] = await db.execute('SELECT * FROM users WHERE mobile = ?', [formattedMobile]);

    let user, isNewUser = false;

    if (!users.length) {
      if (!role || !['employer', 'job_seeker'].includes(role)) {
        return res.status(400).json({ error: 'Valid role required for new user' });
      }
      // is_active = TRUE explicitly set — DB default may be FALSE causing immediate 401
      const [result] = await db.execute(
        `INSERT INTO users (mobile, name, role, is_active) VALUES (?, ?, ?, TRUE)`,
        [formattedMobile, name || null, role]
      );
      const [newUsers] = await db.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user      = newUsers[0];
      isNewUser = true;
    } else {
      user = users[0];
      await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);
    }

    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id:                 user.id,
        mobile:             user.mobile,
        name:               user.name,
        role:               user.role,
        profileCompleted:   user.profile_completed,
        subscriptionStatus: user.subscription_status,
        isVerified:         user.is_verified,
        examPassed:         user.exam_passed,
      },
      isNewUser,
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// Resend just calls requestOTP again
const resendOTP = (req, res) => requestOTP(req, res);

const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    const [skills] = await db.execute(
      `SELECT s.id, s.name, us.proficiency, us.years_experience
       FROM user_skills us JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id = ?`,
      [user.id]
    );

    res.json({
      id:                  user.id,
      mobile:              user.mobile,
      name:                user.name,
      email:               user.email,
      role:                user.role,
      area:                user.area,
      city:                user.city,
      state:               user.state,
      pincode:             user.pincode,
      latitude:            user.latitude,
      longitude:           user.longitude,
      bio:                 user.bio,
      experienceYears:     user.experience_years,
      availability:        user.availability,
      expectedSalaryMin:   user.expected_salary_min,
      expectedSalaryMax:   user.expected_salary_max,
      isVerified:          user.is_verified,
      examPassed:          user.exam_passed,
      subscriptionStatus:  user.subscription_status,
      subscriptionEndDate: user.subscription_end_date,
      profileCompleted:    user.profile_completed,
      skills,
    });
  } catch (error) {
    console.error('Get Current User Error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};

const logout = (req, res) => res.json({ success: true, message: 'Logged out successfully' });

module.exports = { requestOTP, verifyOTPAndLogin, resendOTP, getCurrentUser, logout };