/**
 * Check if user has required role
 * @param  {...string} roles - Allowed roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `This action requires one of these roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

/**
 * Check if user has active subscription
 */
const requireSubscription = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.subscription_status !== 'active') {
    return res.status(403).json({
      error: 'Subscription required',
      message: 'Please subscribe to access this feature',
      code: 'SUBSCRIPTION_REQUIRED'
    });
  }

  next();
};

/**
 * Check if profile is complete
 */
const requireCompleteProfile = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.profile_completed) {
    return res.status(403).json({
      error: 'Profile incomplete',
      message: 'Please complete your profile first',
      code: 'PROFILE_INCOMPLETE'
    });
  }

  next();
};

module.exports = {
  requireRole,
  requireSubscription,
  requireCompleteProfile,
};