/**
 * Haversine formula to calculate distance between two coordinates
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};

const toRad = (deg) => deg * (Math.PI / 180);

/**
 * Get SQL expression for Haversine distance calculation.
 * @param {number} lat         - User's latitude
 * @param {number} lon         - User's longitude
 * @param {string} tableAlias  - Table alias for lat/lng columns
 *                               'j' for jobs table, 'u' for users table
 *                               Prevents "Column 'latitude' is ambiguous" error
 *                               when query joins multiple tables with lat/lng columns.
 */
const getDistanceSQL = (lat, lon, tableAlias = 'j') => {
  const latCol = `${tableAlias}.latitude`;
  const lonCol = `${tableAlias}.longitude`;
  return `(
    6371 * acos(
      cos(radians(${lat})) * cos(radians(${latCol})) *
      cos(radians(${lonCol}) - radians(${lon})) +
      sin(radians(${lat})) * sin(radians(${latCol}))
    )
  )`;
};

/**
 * Get maximum search radius based on subscription status
 */
const getMaxRadius = (subscriptionStatus) => {
  return subscriptionStatus === 'active' ? 100 : 10;
};

module.exports = {
  calculateDistance,
  getDistanceSQL,
  getMaxRadius,
};