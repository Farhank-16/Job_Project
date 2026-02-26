const db = require('../config/database');

const getPagination = (queryPage, queryLimit, defaultLimit = 10) => {
  const page   = Math.max(1, parseInt(queryPage, 10) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(queryLimit, 10) || defaultLimit));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

// Convert empty strings / undefined to null (avoids MySQL decimal/int column crashes)
const toNull    = (val) => (val === undefined || val === null || val === '') ? null : val;
const toNullNum = (val) => {
  if (val === undefined || val === null || val === '') return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name, email, area, city, state, pincode,
      latitude, longitude, bio, experienceYears,
      availability, expectedSalaryMin, expectedSalaryMax, skills,
    } = req.body;

    const fields = ['profile_completed = TRUE'];
    const params = [];

    if (name              !== undefined) { fields.unshift('name = ?');                params.push(toNull(name)); }
    if (email             !== undefined) { fields.splice(-1, 0, 'email = ?');         params.push(toNull(email)); }
    if (area              !== undefined) { fields.splice(-1, 0, 'area = ?');          params.push(toNull(area)); }
    if (city              !== undefined) { fields.splice(-1, 0, 'city = ?');          params.push(toNull(city)); }
    if (state             !== undefined) { fields.splice(-1, 0, 'state = ?');         params.push(toNull(state)); }
    if (pincode           !== undefined) { fields.splice(-1, 0, 'pincode = ?');       params.push(toNull(pincode)); }
    if (latitude          !== undefined) { fields.splice(-1, 0, 'latitude = ?');      params.push(toNullNum(latitude)); }
    if (longitude         !== undefined) { fields.splice(-1, 0, 'longitude = ?');     params.push(toNullNum(longitude)); }
    if (bio               !== undefined) { fields.splice(-1, 0, 'bio = ?');           params.push(toNull(bio)); }
    if (experienceYears   !== undefined) { fields.splice(-1, 0, 'experience_years = ?'); params.push(toNullNum(experienceYears)); }
    if (availability      !== undefined) { fields.splice(-1, 0, 'availability = ?');  params.push(toNull(availability)); }
    if (expectedSalaryMin !== undefined) { fields.splice(-1, 0, 'expected_salary_min = ?'); params.push(toNullNum(expectedSalaryMin)); }
    if (expectedSalaryMax !== undefined) { fields.splice(-1, 0, 'expected_salary_max = ?'); params.push(toNullNum(expectedSalaryMax)); }

    params.push(userId);
    await db.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

    if (Array.isArray(skills)) {
      await db.execute('DELETE FROM user_skills WHERE user_id = ?', [userId]);
      for (const skill of skills) {
        await db.execute(
          `INSERT INTO user_skills (user_id, skill_id, proficiency, years_experience) VALUES (?, ?, ?, ?)`,
          [userId, skill.skillId, skill.proficiency || 'beginner', skill.yearsExperience || 0]
        );
      }
    }

    const [[user]] = await db.execute('SELECT * FROM users WHERE id = ?', [userId]);
    const [userSkills] = await db.execute(
      `SELECT s.id, s.name, us.proficiency, us.years_experience
       FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id:                  user.id,
        mobile:              user.mobile,
        name:                user.name,
        email:               user.email,
        role:                user.role,
        area:                user.area,
        city:                user.city,
        state:               user.state,
        pincode:             user.pincode,
        latitude:            user.latitude,
        longitude:           user.longitude,
        bio:                 user.bio,
        experienceYears:     user.experience_years,
        availability:        user.availability,
        expectedSalaryMin:   user.expected_salary_min,
        expectedSalaryMax:   user.expected_salary_max,
        isVerified:          user.is_verified,
        examPassed:          user.exam_passed,
        subscriptionStatus:  user.subscription_status,
        subscriptionEndDate: user.subscription_end_date,
        profileCompleted:    user.profile_completed,
        skills:              userSkills,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Profile photo removed — frontend uses NameAvatar (first letter of name)
// uploadProfilePhoto function removed entirely

const getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.execute(
      `SELECT u.id, u.name, u.area, u.city, u.state, u.bio,
              u.experience_years, u.availability, u.is_verified, u.exam_passed,
              u.role, u.created_at
       FROM users u WHERE u.id = ? AND u.is_active = TRUE`,
      [id]
    );

    if (!users.length) return res.status(404).json({ error: 'User not found' });

    const [skills] = await db.execute(
      `SELECT s.id, s.name, us.proficiency, us.years_experience
       FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = ?`,
      [id]
    );

    const canContact = req.user && (req.user.id === parseInt(id) || req.user.subscription_status === 'active');

    let mobile = null;
    if (canContact) {
      const [[mobileRow]] = await db.execute('SELECT mobile FROM users WHERE id = ?', [id]);
      mobile = mobileRow?.mobile ?? null;
    }

    res.json({ ...users[0], skills, canContact, mobile });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

const getAppliedJobs = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);

    // employer_photo removed — frontend uses NameAvatar
    const [applications] = await db.query(
      `SELECT ja.*, j.title, j.job_type, j.salary_min, j.salary_max,
              j.city as job_city, j.area as job_area,
              u.name as employer_name, s.name as skill_name
       FROM job_applications ja
       JOIN jobs j   ON ja.job_id = j.id
       JOIN users u  ON j.employer_id = u.id
       LEFT JOIN skills s ON j.skill_id = s.id
       WHERE ja.applicant_id = ?
       ORDER BY ja.applied_at DESC LIMIT ${limit} OFFSET ${offset}`,
      [req.user.id]
    );

    const [[total]] = await db.execute(
      'SELECT COUNT(*) as count FROM job_applications WHERE applicant_id = ?',
      [req.user.id]
    );

    res.json({ applications, pagination: { page, limit, total: total.count, pages: Math.ceil(total.count / limit) } });
  } catch (error) {
    console.error('Get Applied Jobs Error:', error);
    res.status(500).json({ error: 'Failed to get applied jobs' });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, area, city, state, pincode } = req.body;

    if (!latitude || !longitude) return res.status(400).json({ error: 'Latitude and longitude required' });

    const fields = ['latitude = ?', 'longitude = ?'];
    const params = [latitude, longitude];

    if (area    !== undefined) { fields.push('area = ?');    params.push(toNull(area)); }
    if (city    !== undefined) { fields.push('city = ?');    params.push(toNull(city)); }
    if (state   !== undefined) { fields.push('state = ?');   params.push(toNull(state)); }
    if (pincode !== undefined) { fields.push('pincode = ?'); params.push(toNull(pincode)); }

    params.push(req.user.id);
    await db.execute(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

    res.json({ success: true, message: 'Location updated' });
  } catch (error) {
    console.error('Update Location Error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
};

module.exports = { updateProfile, getProfile, getAppliedJobs, updateLocation };