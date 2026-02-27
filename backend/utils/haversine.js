const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => deg * (Math.PI / 180);
  const R     = 6371;
  const dLat  = toRad(lat2 - lat1);
  const dLon  = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 100) / 100;
};

// tableAlias prevents "Column 'latitude' is ambiguous" when joining jobs+users
// Use 'j' for jobs table, 'u' for users table
const getDistanceSQL = (lat, lon, tableAlias = 'j') => `(
  6371 * acos(
    cos(radians(${lat})) * cos(radians(${tableAlias}.latitude)) *
    cos(radians(${tableAlias}.longitude) - radians(${lon})) +
    sin(radians(${lat})) * sin(radians(${tableAlias}.latitude))
  )
)`;

const getMaxRadius = (subscriptionStatus) => subscriptionStatus === 'active' ? 100 : 10;

module.exports = { calculateDistance, getDistanceSQL, getMaxRadius };