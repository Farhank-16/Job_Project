const db = require('../config/database');

/**
 * Safe pagination helper
 */
const getPagination = (queryPage, queryLimit, defaultLimit = 10) => {
  const page  = Math.max(1, parseInt(queryPage,  10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(queryLimit, 10) || defaultLimit));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name, email, area, city, state, pincode,
      latitude, longitude, bio, experienceYears,
      availability, expectedSalaryMin, expectedSalaryMax,
      skills,
    } = req.body;

    // Build SET dynamically — skip undefined fields entirely
    // COALESCE(undefined, col) crashes mysql2; dynamic builder avoids it
    const fields = [];
    const params = [];

    if (name             !== undefined) { fields.push('name = ?');                params.push(name); }
    if (email            !== undefined) { fields.push('email = ?');               params.push(email); }
    if (area             !== undefined) { fields.push('area = ?');                params.push(area); }
    if (city             !== undefined) { fields.push('city = ?');                params.push(city); }
    if (state            !== undefined) { fields.push('state = ?');               params.push(state); }
    if (pincode          !== undefined) { fields.push('pincode = ?');             params.push(pincode); }
    if (latitude         !== undefined) { fields.push('latitude = ?');            params.push(latitude); }
    if (longitude        !== undefined) { fields.push('longitude = ?');           params.push(longitude); }
    if (bio              !== undefined) { fields.push('bio = ?');                 params.push(bio); }
    if (experienceYears  !== undefined) { fields.push('experience_years = ?');    params.push(experienceYears); }
    if (availability     !== undefined) { fields.push('availability = ?');        params.push(availability); }
    if (expectedSalaryMin!== undefined) { fields.push('expected_salary_min = ?'); params.push(expectedSalaryMin); }
    if (expectedSalaryMax!== undefined) { fields.push('expected_salary_max = ?'); params.push(expectedSalaryMax); }

    // Always mark profile as completed on update
    fields.push('profile_completed = TRUE');
    params.push(userId);

    if (fields.length > 1) { // more than just profile_completed
      await db.execute(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        params
      );
    }

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      await db.execute('DELETE FROM user_skills WHERE user_id = ?', [userId]);

      for (const skill of skills) {
        await db.execute(
          `INSERT INTO user_skills (user_id, skill_id, proficiency, years_experience)
           VALUES (?, ?, ?, ?)`,
          [userId, skill.skillId, skill.proficiency || 'beginner', skill.yearsExperience || 0]
        );
      }
    }

    const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: users[0],
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

/**
 * Upload profile photo
 */
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const photoUrl = `/uploads/${req.file.filename}`;

    await db.execute(
      'UPDATE users SET profile_photo = ? WHERE id = ?',
      [photoUrl, req.user.id]
    );

    res.json({ success: true, photoUrl });
  } catch (error) {
    console.error('Upload Photo Error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

/**
 * Get user profile by ID (public)
 */
const getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.execute(
      `SELECT 
        u.id, u.name, u.profile_photo, u.area, u.city, u.state,
        u.bio, u.experience_years, u.availability, u.is_verified,
        u.exam_passed, u.role, u.created_at
       FROM users u WHERE u.id = ? AND u.is_active = TRUE`,
      [id]
    );

    if (!users.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    const [skills] = await db.execute(
      `SELECT s.id, s.name, us.proficiency, us.years_experience
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id = ?`,
      [id]
    );

    let canContact = false;
    if (req.user) {
      if (req.user.id === parseInt(id)) {
        canContact = true;
      } else if (req.user.subscription_status === 'active') {
        canContact = true;
      }
    }

    let mobile = null;
    if (canContact) {
      const [mobileRow] = await db.execute('SELECT mobile FROM users WHERE id = ?', [id]);
      mobile = mobileRow[0]?.mobile ?? null;
    }

    res.json({ ...user, skills, canContact, mobile });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

/**
 * Get user's applied jobs
 */
const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);

    // Use db.query() with inline LIMIT/OFFSET to avoid mysql2 prepared-statement bug
    const [applications] = await db.query(
      `SELECT 
        ja.*,
        j.title, j.job_type, j.salary_min, j.salary_max,
        j.city as job_city, j.area as job_area,
        u.name as employer_name, u.profile_photo as employer_photo,
        s.name as skill_name
       FROM job_applications ja
       JOIN jobs j ON ja.job_id = j.id
       JOIN users u ON j.employer_id = u.id
       LEFT JOIN skills s ON j.skill_id = s.id
       WHERE ja.applicant_id = ?
       ORDER BY ja.applied_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      [userId]
    );

    const [total] = await db.execute(
      'SELECT COUNT(*) as count FROM job_applications WHERE applicant_id = ?',
      [userId]
    );

    res.json({
      applications,
      pagination: {
        page,
        limit,
        total: total[0].count,
        pages: Math.ceil(total[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Get Applied Jobs Error:', error);
    res.status(500).json({ error: 'Failed to get applied jobs' });
  }
};

/**
 * Update user location
 */
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, area, city, state, pincode } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    // Dynamic builder for optional fields
    const fields = ['latitude = ?', 'longitude = ?'];
    const params = [latitude, longitude];

    if (area    !== undefined) { fields.push('area = ?');    params.push(area); }
    if (city    !== undefined) { fields.push('city = ?');    params.push(city); }
    if (state   !== undefined) { fields.push('state = ?');   params.push(state); }
    if (pincode !== undefined) { fields.push('pincode = ?'); params.push(pincode); }

    params.push(req.user.id);

    await db.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    console.error('Update Location Error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

module.exports = {
  updateProfile,
  uploadProfilePhoto,
  getProfile,
  getAppliedJobs,
  updateLocation,
};