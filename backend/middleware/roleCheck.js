const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

const requireSubscription = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (req.user.subscription_status !== 'active') {
    return res.status(403).json({ error: 'Subscription required', code: 'SUBSCRIPTION_REQUIRED' });
  }
  next();
};

const requireCompleteProfile = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  if (!req.user.profile_completed) {
    return res.status(403).json({ error: 'Profile incomplete', code: 'PROFILE_INCOMPLETE' });
  }
  next();
};

module.exports = { requireRole, requireSubscription, requireCompleteProfile };