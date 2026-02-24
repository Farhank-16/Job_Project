const db = require('../config/database');
const { getDistanceSQL, getMaxRadius } = require('../utils/haversine');

class MatchingEngine {
  /**
   * Find matching jobs for a job seeker - FIXED
   */
  async findJobsForSeeker(seeker, filters = {}) {
  const { skillId, radius, availability, page = 1, limit = 10 } = filters;
  const maxRadius = Math.min(radius || 10, getMaxRadius(seeker.subscription_status));

  const distanceSQL = getDistanceSQL(seeker.latitude, seeker.longitude, 'j');

  let query = `
    SELECT 
      j.*,
      s.name as skill_name,
      u.name as employer_name,
      u.profile_photo as employer_photo,
      ${distanceSQL} as distance
    FROM jobs j
    LEFT JOIN skills s ON j.skill_id = s.id
    LEFT JOIN users u ON j.employer_id = u.id
    WHERE j.is_active = TRUE
      AND (j.expires_at IS NULL OR j.expires_at > NOW())
      AND ${distanceSQL} <= ?
  `;
  
  const params = [maxRadius];

  // Filter by skill
  if (skillId) {
    query += ` AND j.skill_id = ?`;
    params.push(skillId);
  }

  // Filter by availability
  if (availability) {
    query += ` AND (j.availability_required = ? OR j.availability_required = 'flexible')`;
    params.push(availability);
  }

  // Match with seeker's skills
  query += `
    AND j.skill_id IN (
      SELECT skill_id FROM user_skills WHERE user_id = ?
    )
  `;
  params.push(seeker.id);

  // ✅ FIX: Inline LIMIT/OFFSET - mysql2 execute() LIMIT ? BUG
  query += ` ORDER BY distance ASC LIMIT ${limit} OFFSET ${(page - 1) * limit}`;

  console.log('MatchingEngine query:', query);
  ('MatchingEngine params:', params);

  const [jobs] = await db.execute(query, params);
  return jobs;
}

  /**
   * Find matching candidates for an employer - FIXED
   */
  async findCandidatesForEmployer(employer, filters = {}) {
    const { skillId, radius, availability, page = 1, limit = 10 } = filters;
    const maxRadius = Math.min(radius || 10, getMaxRadius(employer.subscription_status));
    const offset = (page - 1) * limit;

    // Get employer's location from job or profile
    const lat = filters.latitude || employer.latitude;
    const lon = filters.longitude || employer.longitude;

    if (!lat || !lon) {
      throw new Error('Location required for candidate search');
    }

    // ✅ FIX: Add table alias 'u' for users table
    const distanceSQL = getDistanceSQL(lat, lon, 'u');

    let query = `
      SELECT 
        u.id,
        u.name,
        u.profile_photo,
        u.area,
        u.city,
        u.experience_years,
        u.availability,
        u.is_verified,
        u.exam_passed,
        u.subscription_status,
        ${distanceSQL} as distance,
        GROUP_CONCAT(DISTINCT s.name) as skills
      FROM users u
      LEFT JOIN user_skills us ON u.id = us.user_id
      LEFT JOIN skills s ON us.skill_id = s.id
      WHERE u.role = 'job_seeker'
        AND u.is_active = TRUE
        AND u.profile_completed = TRUE
        AND ${distanceSQL} <= ?
    `;
    
    const params = [maxRadius];

    // Filter by skill
    if (skillId) {
      query += ` AND us.skill_id = ?`;
      params.push(skillId);
    }

    // Filter by availability
    if (availability) {
      query += ` AND u.availability = ?`;
      params.push(availability);
    }

    query += ` GROUP BY u.id`;

    // Ranking
    query += `
  ORDER BY 
    (u.is_verified = TRUE AND u.exam_passed = TRUE) DESC,
    u.is_verified DESC,
    u.exam_passed DESC,
    (u.subscription_status = 'active') DESC,
    distance ASC
  LIMIT ${limit} OFFSET ${offset}
`;
    // params.push(limit, offset);

    const [candidates] = await db.execute(query, params);
    
    // Hide contact info for free employers
    if (employer.subscription_status !== 'active') {
      candidates.forEach(c => {
        c.mobile = null;
        c.canContact = false;
      });
    } else {
      candidates.forEach(c => {
        c.canContact = true;
      });
    }

    return candidates;
  }

  /**
   * Get job recommendations for a seeker
   */
  async getRecommendations(seekerId, limit = 5) {
    const [seeker] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [seekerId]
    );

    if (!seeker[0]) {
      throw new Error('User not found');
    }

    return this.findJobsForSeeker(seeker[0], { limit });
  }
}

module.exports = new MatchingEngine();
