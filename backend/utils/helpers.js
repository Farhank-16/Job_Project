/**
 * Paginate results
 */
const paginate = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit: parseInt(limit), offset };
};

/**
 * Format phone number
 */
const formatMobile = (mobile) => {
  // Remove all non-digits
  let cleaned = mobile.replace(/\D/g, '');
  
  // Remove country code if present
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }
  
  return cleaned;
};

/**
 * Validate Indian mobile number
 */
const isValidMobile = (mobile) => {
  const cleaned = formatMobile(mobile);
  return /^[6-9]\d{9}$/.test(cleaned);
};

/**
 * Generate unique order ID
 */
const generateOrderId = (prefix = 'ORD') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
};

/**
 * Check if subscription is active
 */
const isSubscriptionActive = (user) => {
  if (user.subscription_status !== 'active') return false;
  if (!user.subscription_end_date) return false;
  return new Date(user.subscription_end_date) > new Date();
};

/**
 * Format date for display
 */
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

module.exports = {
  paginate,
  formatMobile,
  isValidMobile,
  generateOrderId,
  isSubscriptionActive,
  formatDate,
};