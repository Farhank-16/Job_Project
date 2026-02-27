const formatMobile = (mobile) => {
  let cleaned = mobile.replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) cleaned = cleaned.substring(2);
  return cleaned;
};

const isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(formatMobile(mobile));

const generateOrderId = (prefix = 'ORD') => {
  const timestamp = Date.now().toString(36);
  const random    = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
};

const isSubscriptionActive = (user) =>
  user.subscription_status === 'active' &&
  user.subscription_end_date &&
  new Date(user.subscription_end_date) > new Date();

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

module.exports = { formatMobile, isValidMobile, generateOrderId, isSubscriptionActive, formatDate };