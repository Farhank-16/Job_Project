const jwt    = require('jsonwebtoken');
const config = require('../config/config');
const db     = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(authHeader.split(' ')[1], config.jwt.secret);

    const [users] = await db.execute(
      'SELECT * FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    if (!users.length) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    const user = users[0];

    // Auto-expire subscription if end date passed
    if (user.subscription_status === 'active' && user.subscription_end_date) {
      if (new Date(user.subscription_end_date) < new Date()) {
        await db.execute('UPDATE users SET subscription_status = ? WHERE id = ?', ['expired', user.id]);
        user.subscription_status = 'expired';
      }
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError')  return res.status(401).json({ error: 'Token expired' });
    if (error.name === 'JsonWebTokenError')  return res.status(401).json({ error: 'Invalid token' });
    console.error('Auth Error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(authHeader.split(' ')[1], config.jwt.secret);
    const [users] = await db.execute(
      'SELECT * FROM users WHERE id = ? AND is_active = TRUE',
      [decoded.userId]
    );

    req.user = users[0] || null;
    next();
  } catch {
    req.user = null;
    next();
  }
};

const generateToken = (userId, role) =>
  jwt.sign({ userId, role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

module.exports = { authenticate, optionalAuth, generateToken };