const db = require('../config/database');
const { getDistanceSQL, getMaxRadius } = require('../utils/haversine');

class MatchingEngine {
  /**
   * Find matching jobs for a job seeker
   */
  async findJobsForSeeker(seeker, filters = {}) {
    const { skillId, availability, page = 1, limit = 10 } = filters;

    // FIX 1: If seeker has no location, skip distance filtering entirely
    // New users won't have lat/lng yet — don't crash, just return jobs by date
    const hasLocation = seeker.latitude && seeker.longitude;
    const maxRadius = Math.min(filters.radius || 10, getMaxRadius(seeker.subscription_status));

    // Safe integer pagination
    const safePage   = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit  = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset     = (safePage - 1) * safeLimit;

    let query;
    let params;

    if (hasLocation) {
      // FIX 2: Qualify latitude/longitude with j. prefix to avoid ambiguous column error
      // jobs (j) and users (u) both have latitude/longitude columns
      const distanceSQL = getDistanceSQL(seeker.latitude, seeker.longitude, 'j');

      query = `
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
      params = [maxRadius];
    } else {
      // No location — skip distance filter, show all active jobs
      query = `
        SELECT 
          j.*,
          s.name as skill_name,
          u.name as employer_name,
          u.profile_photo as employer_photo,
          NULL as distance
        FROM jobs j
        LEFT JOIN skills s ON j.skill_id = s.id
        LEFT JOIN users u ON j.employer_id = u.id
        WHERE j.is_active = TRUE
          AND (j.expires_at IS NULL OR j.expires_at > NOW())
      `;
      params = [];
    }

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

    // Match seeker's skills — only if seeker has skills set
    query += `
      AND j.skill_id IN (
        SELECT skill_id FROM user_skills WHERE user_id = ?
      )
    `;
    params.push(seeker.id);

    // Order and paginate — inline LIMIT/OFFSET to avoid mysql2 prepared-stmt bug
    if (hasLocation) {
      query += ` ORDER BY distance ASC LIMIT ${safeLimit} OFFSET ${offset}`;
    } else {
      query += ` ORDER BY j.created_at DESC LIMIT ${safeLimit} OFFSET ${offset}`;
    }

    const [jobs] = await db.query(query, params);
    return jobs;
  }

  /**
   * Find matching candidates for an employer
   */
  async findCandidatesForEmployer(employer, filters = {}) {
    const { skillId, availability, page = 1, limit = 10 } = filters;
    const maxRadius = Math.min(filters.radius || 10, getMaxRadius(employer.subscription_status));

    const safePage  = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset    = (safePage - 1) * safeLimit;

    const lat = filters.latitude || employer.latitude;
    const lon = filters.longitude || employer.longitude;

    if (!lat || !lon) {
      throw new Error('Location required for candidate search');
    }

    // FIX 2: Pass table alias 'u' so haversine uses u.latitude, u.longitude
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

    if (skillId) {
      query += ` AND us.skill_id = ?`;
      params.push(skillId);
    }

    if (availability) {
      query += ` AND u.availability = ?`;
      params.push(availability);
    }

    query += ` GROUP BY u.id`;
    query += `
      ORDER BY 
        (u.is_verified = TRUE AND u.exam_passed = TRUE) DESC,
        u.is_verified DESC,
        u.exam_passed DESC,
        (u.subscription_status = 'active') DESC,
        distance ASC
      LIMIT ${safeLimit} OFFSET ${offset}
    `;

    const [candidates] = await db.query(query, params);

    if (employer.subscription_status !== 'active') {
      candidates.forEach(c => { c.mobile = null; c.canContact = false; });
    } else {
      candidates.forEach(c => { c.canContact = true; });
    }

    return candidates;
  }

  /**
   * Get job recommendations for a seeker
   */
  async getRecommendations(seekerId, limit = 5) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE id = ?',
      [seekerId]
    );

    if (!rows[0]) {
      throw new Error('User not found');
    }

    // FIX 3: If new user has no skills yet, return empty array gracefully
    // instead of running a query that returns nothing with confusing errors
    const [skillCheck] = await db.execute(
      'SELECT COUNT(*) as count FROM user_skills WHERE user_id = ?',
      [seekerId]
    );

    if (skillCheck[0].count === 0) {
      // New user — no skills set yet, return latest jobs instead
      const [jobs] = await db.query(`
        SELECT 
          j.*,
          s.name as skill_name,
          u.name as employer_name,
          u.profile_photo as employer_photo
        FROM jobs j
        LEFT JOIN skills s ON j.skill_id = s.id
        LEFT JOIN users u ON j.employer_id = u.id
        WHERE j.is_active = TRUE
          AND (j.expires_at IS NULL OR j.expires_at > NOW())
        ORDER BY j.created_at DESC
        LIMIT ${parseInt(limit, 10) || 5} OFFSET 0
      `);
      return jobs;
    }

    return this.findJobsForSeeker(rows[0], { limit });
  }
}

module.exports = new MatchingEngine();