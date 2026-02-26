const db = require('../config/database');
const { getDistanceSQL, getMaxRadius } = require('../utils/haversine');

class MatchingEngine {

  async findJobsForSeeker(seeker, filters = {}) {
    const { skillId, availability, page = 1, limit = 10 } = filters;

    const hasLocation = seeker.latitude && seeker.longitude;
    const maxRadius   = Math.min(filters.radius || 10, getMaxRadius(seeker.subscription_status));
    const safePage    = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit   = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset      = (safePage - 1) * safeLimit;

    let query, params;

    if (hasLocation) {
      const distSQL = getDistanceSQL(seeker.latitude, seeker.longitude, 'j');
      query = `
        SELECT j.*, s.name as skill_name, u.name as employer_name,
               ${distSQL} as distance
        FROM jobs j
        LEFT JOIN skills s ON j.skill_id = s.id
        LEFT JOIN users u  ON j.employer_id = u.id
        WHERE j.is_active = TRUE
          AND (j.expires_at IS NULL OR j.expires_at > NOW())
          AND ${distSQL} <= ?
      `;
      params = [maxRadius];
    } else {
      query = `
        SELECT j.*, s.name as skill_name, u.name as employer_name,
               NULL as distance
        FROM jobs j
        LEFT JOIN skills s ON j.skill_id = s.id
        LEFT JOIN users u  ON j.employer_id = u.id
        WHERE j.is_active = TRUE
          AND (j.expires_at IS NULL OR j.expires_at > NOW())
      `;
      params = [];
    }

    if (skillId)      { query += ` AND j.skill_id = ?`;                                                       params.push(skillId); }
    if (availability) { query += ` AND (j.availability_required = ? OR j.availability_required = 'flexible')`; params.push(availability); }

    query += ` AND j.skill_id IN (SELECT skill_id FROM user_skills WHERE user_id = ?)`;
    params.push(seeker.id);

    query += hasLocation
      ? ` ORDER BY distance ASC LIMIT ${safeLimit} OFFSET ${offset}`
      : ` ORDER BY j.created_at DESC LIMIT ${safeLimit} OFFSET ${offset}`;

    const [jobs] = await db.query(query, params);
    return jobs;
  }

  async findCandidatesForEmployer(employer, filters = {}) {
    const { skillId, availability, page = 1, limit = 10 } = filters;
    const maxRadius = Math.min(filters.radius || 10, getMaxRadius(employer.subscription_status));
    const safePage  = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset    = (safePage - 1) * safeLimit;

    const lat = filters.latitude  || employer.latitude;
    const lon = filters.longitude || employer.longitude;

    if (!lat || !lon) throw new Error('Location required for candidate search');

    const distSQL = getDistanceSQL(lat, lon, 'u');

    let query = `
      SELECT u.id, u.name, u.area, u.city, u.experience_years,
             u.availability, u.is_verified, u.exam_passed, u.subscription_status,
             ${distSQL} as distance,
             GROUP_CONCAT(DISTINCT s.name) as skills
      FROM users u
      LEFT JOIN user_skills us ON u.id = us.user_id
      LEFT JOIN skills s       ON us.skill_id = s.id
      WHERE u.role = 'job_seeker'
        AND u.is_active = TRUE
        AND u.profile_completed = TRUE
        AND ${distSQL} <= ?
    `;
    const params = [maxRadius];

    if (skillId)      { query += ` AND us.skill_id = ?`;    params.push(skillId); }
    if (availability) { query += ` AND u.availability = ?`; params.push(availability); }

    query += `
      GROUP BY u.id
      ORDER BY
        (u.is_verified = TRUE AND u.exam_passed = TRUE) DESC,
        u.is_verified DESC,
        u.exam_passed DESC,
        (u.subscription_status = 'active') DESC,
        distance ASC
      LIMIT ${safeLimit} OFFSET ${offset}
    `;

    const [candidates] = await db.query(query, params);

    // Mobile hidden from unsubscribed employers
    const subscribed = employer.subscription_status === 'active';
    candidates.forEach(c => {
      c.canContact = subscribed;
      if (!subscribed) c.mobile = null;
    });

    return candidates;
  }

  async getRecommendations(seekerId, limit = 5) {
    const [[seeker]] = await db.execute('SELECT * FROM users WHERE id = ?', [seekerId]);
    if (!seeker) throw new Error('User not found');

    const [[{ count }]] = await db.execute(
      'SELECT COUNT(*) as count FROM user_skills WHERE user_id = ?',
      [seekerId]
    );

    // New user with no skills — return latest jobs instead
    if (count === 0) {
      const [jobs] = await db.query(`
        SELECT j.*, s.name as skill_name, u.name as employer_name
        FROM jobs j
        LEFT JOIN skills s ON j.skill_id = s.id
        LEFT JOIN users u  ON j.employer_id = u.id
        WHERE j.is_active = TRUE AND (j.expires_at IS NULL OR j.expires_at > NOW())
        ORDER BY j.created_at DESC
        LIMIT ${parseInt(limit, 10) || 5} OFFSET 0
      `);
      return jobs;
    }

    return this.findJobsForSeeker(seeker, { limit });
  }
}

module.exports = new MatchingEngine();