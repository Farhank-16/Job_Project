const db = require('../config/database');
const { paginate } = require('../utils/helpers');

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      email,
      area,
      city,
      state,
      pincode,
      latitude,
      longitude,
      bio,
      experienceYears,
      availability,
      expectedSalaryMin,
      expectedSalaryMax,
      skills,
    } = req.body;

    // Handle undefined values by replacing them with null
    const valuesToUpdate = [
      name || null,
      email || null,
      area || null,
      city || null,
      state || null,
      pincode || null,
      latitude || null,
      longitude || null,
      bio || null,
      experienceYears || null,
      availability || null,
      expectedSalaryMin || null,
      expectedSalaryMax || null,
      userId
    ];

    // Update user details with COALESCE to avoid undefined values
    await db.execute(
      `UPDATE users SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        area = COALESCE(?, area),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        bio = COALESCE(?, bio),
        experience_years = COALESCE(?, experience_years),
        availability = COALESCE(?, availability),
        expected_salary_min = COALESCE(?, expected_salary_min),
        expected_salary_max = COALESCE(?, expected_salary_max),
        profile_completed = TRUE
      WHERE id = ?`,
      valuesToUpdate
    );

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      // Remove existing skills
      await db.execute('DELETE FROM user_skills WHERE user_id = ?', [userId]);
      
      // Add new skills
      for (const skill of skills) {
        await db.execute(
          `INSERT INTO user_skills (user_id, skill_id, proficiency, years_experience)
           VALUES (?, ?, ?, ?)`,
          [
            userId,
            skill.skillId,
            skill.proficiency || 'beginner',  // Default proficiency if not provided
            skill.yearsExperience || 0  // Default yearsExperience if not provided
          ]
        );
      }
    }

    // Get updated user
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

    res.json({
      success: true,
      photoUrl,
    });
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

    // Get skills
    const [skills] = await db.execute(
      `SELECT s.id, s.name, us.proficiency, us.years_experience
       FROM user_skills us
       JOIN skills s ON us.skill_id = s.id
       WHERE us.user_id = ?`,
      [id]
    );

    // Check if requester can see contact info
    let canContact = false;
    if (req.user) {
      if (req.user.id === parseInt(id)) {
        canContact = true;
      } else if (req.user.subscription_status === 'active') {
        canContact = true;
      }
    }

    res.json({
      ...user,
      skills,
      canContact,
      mobile: canContact ? (await db.execute('SELECT mobile FROM users WHERE id = ?', [id]))[0][0].mobile : null,
    });
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
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit); // Inline calculation

    const [applications] = await db.execute(
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
       LIMIT ${limit} OFFSET ${offset}`, // ✅ INLINE NUMBERS - FIXED
      [userId] // ✅ ONLY 1 param now
    );

    const [total] = await db.execute(
      'SELECT COUNT(*) as count FROM job_applications WHERE applicant_id = ?',
      [userId]
    );

    res.json({
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].count,
        pages: Math.ceil(total[0].count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get Applied Jobs Error:', error);
    res.status(500).json({ error: 'Failed to get applied jobs', details: error.message });
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

    await db.execute(
      `UPDATE users SET 
        latitude = ?, longitude = ?, 
        area = COALESCE(?, area),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode)
       WHERE id = ?`,
      [latitude, longitude, area, city, state, pincode, req.user.id]
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