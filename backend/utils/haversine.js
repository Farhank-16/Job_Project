/**
 * Haversine formula to calculate distance between two coordinates
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

const toRad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Get SQL query for distance calculation
 * @param {number} lat - User's latitude
 * @param {number} lon - User's longitude
 * @returns {string} SQL expression for distance
 */
const getDistanceSQL = (lat, lon) => {
  return `(
    6371 * acos(
      cos(radians(${lat})) * cos(radians(latitude)) *
      cos(radians(longitude) - radians(${lon})) +
      sin(radians(${lat})) * sin(radians(latitude))
    )
  )`;
};

/**
 * Get maximum radius based on subscription status
 * @param {string} subscriptionStatus - User's subscription status
 * @returns {number} Maximum radius in km
 */
const getMaxRadius = (subscriptionStatus) => {
  return subscriptionStatus === 'active' ? 100 : 10;
};

module.exports = {
  calculateDistance,
  getDistanceSQL,
  getMaxRadius,
};