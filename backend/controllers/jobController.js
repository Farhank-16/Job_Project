const db = require('../config/database');
const matchingEngine = require('../services/matchingEngine');
const { paginate } = require('../utils/helpers');
const { getDistanceSQL, getMaxRadius } = require('../utils/haversine');

/**
 * Create a new job
 */
const createJob = async (req, res) => {
  try {
    const employerId = req.user.id;
    const {
      title, description, skillId, jobType, salaryMin, salaryMax, salaryType,
      area, city, state, latitude, longitude, radiusKm, vacancies,
      availabilityRequired, experienceRequired, expiresAt,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Job title is required' });
    }

    // ✅ FIX: Convert undefined → null for ALL params
    const params = [
      employerId, 
      title, 
      description || null, 
      parseInt(skillId) || null, 
      jobType || 'full_time',
      parseFloat(salaryMin) || null, 
      parseFloat(salaryMax) || null, 
      salaryType || 'monthly', 
      area || null, 
      city || null, 
      state || null,
      parseFloat(latitude) || req.user.latitude || null, 
      parseFloat(longitude) || req.user.longitude || null,
      parseInt(radiusKm) || 10, 
      parseInt(vacancies) || 1, 
      availabilityRequired || 'flexible',
      parseInt(experienceRequired) || 0, 
      expiresAt || null
    ];

    // ✅ Debug: Log params to see undefined values
    console.log('Job params:', params.map((p, i) => ({ i, value: p, type: typeof p })));

    const [result] = await db.execute(
      `INSERT INTO jobs (
        employer_id, title, description, skill_id, job_type,
        salary_min, salary_max, salary_type, area, city, state,
        latitude, longitude, radius_km, vacancies,
        availability_required, experience_required, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params
    );

    const [job] = await db.execute('SELECT * FROM jobs WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job: job[0],
    });
  } catch (error) {
    console.error('Create Job Error:', error);
    res.status(500).json({ error: 'Failed to create job', details: error.message });
  }
};

/**
 * Get all jobs with filters
 */
const getJobs = async (req, res) => {
  try {
    const { 
      skillId, 
      city, 
      radius = 10,
      jobType,
      availability,
      page = 1, 
      limit = 10 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit); // Inline calculation

    let query = `
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
    `;
    
    const params = [];

    // Add filters
    if (skillId) {
      query += ` AND j.skill_id = ?`;
      params.push(skillId);
    }

    if (city) {
      query += ` AND j.city LIKE ?`;
      params.push(`%${city}%`);
    }

    if (jobType) {
      query += ` AND j.job_type = ?`;
      params.push(jobType);
    }

    let orderByClause = ` ORDER BY j.created_at DESC`;

    // Distance filter
    if (req.user && req.user.latitude && req.user.longitude) {
      const maxRadius = Math.min(parseInt(radius), getMaxRadius(req.user.subscription_status));
      const distanceSQL = getDistanceSQL(req.user.latitude, req.user.longitude, 'j');
      
      query += ` AND ${distanceSQL} <= ?`;
      params.push(maxRadius);
      orderByClause = ` ORDER BY ${distanceSQL} ASC`;
    }

    // ✅ FIXED: Inline LIMIT/OFFSET - NO ? placeholders
    query += `${orderByClause} LIMIT ${limit} OFFSET ${offset}`;

    console.log('Jobs params:', params);
    console.log('Jobs LIMIT/OFFSET:', limit, offset);

    const [jobs] = await db.execute(query, params);

    // Count query (unchanged)
    let countQuery = `
      SELECT COUNT(*) as count FROM jobs j 
      WHERE j.is_active = TRUE AND (j.expires_at IS NULL OR j.expires_at > NOW())
    `;
    const countParams = [];
    if (skillId) {
      countQuery += ` AND j.skill_id = ?`;
      countParams.push(skillId);
    }
    if (city) {
      countQuery += ` AND j.city LIKE ?`;
      countParams.push(`%${city}%`);
    }
    if (jobType) {
      countQuery += ` AND j.job_type = ?`;
      countParams.push(jobType);
    }
    
    const [total] = await db.execute(countQuery, countParams);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].count,
        pages: Math.ceil(total[0].count / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get Jobs Error:', error);
    res.status(500).json({ error: 'Failed to get jobs', details: error.message });
  }
};

/**
 * Get single job by ID
 */
const getJob = async (req, res) => {
  try {
    const { id } = req.params;

    const [jobs] = await db.execute(
      `SELECT 
        j.*,
        s.name as skill_name,
        u.name as employer_name,
        u.profile_photo as employer_photo,
        u.mobile as employer_mobile,
        u.is_verified as employer_verified
       FROM jobs j
       LEFT JOIN skills s ON j.skill_id = s.id
       LEFT JOIN users u ON j.employer_id = u.id
       WHERE j.id = ?`,
      [id]
    );

    if (!jobs.length) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobs[0];

    // Increment view count
    await db.execute(
      'UPDATE jobs SET views_count = views_count + 1 WHERE id = ?',
      [id]
    );

    // Check if user has applied
    let hasApplied = false;
    if (req.user && req.user.role === 'job_seeker') {
      const [applications] = await db.execute(
        'SELECT id FROM job_applications WHERE job_id = ? AND applicant_id = ?',
        [id, req.user.id]
      );
      hasApplied = applications.length > 0;
    }

    // Hide employer contact if not subscribed
    if (!req.user || req.user.subscription_status !== 'active') {
      job.employer_mobile = null;
    }

    res.json({
      ...job,
      hasApplied,
      canApply: req.user && req.user.role === 'job_seeker' && req.user.subscription_status === 'active',
    });
  } catch (error) {
    console.error('Get Job Error:', error);
    res.status(500).json({ error: 'Failed to get job' });
  }
};

/**
 * Apply for a job
 */
const applyForJob = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { coverLetter } = req.body;
    const applicantId = req.user.id;

    // Check subscription
    if (req.user.subscription_status !== 'active') {
      return res.status(403).json({
        error: 'Subscription required',
        code: 'SUBSCRIPTION_REQUIRED',
      });
    }

    // Check if job exists and is active
    const [jobs] = await db.execute(
      'SELECT * FROM jobs WHERE id = ? AND is_active = TRUE',
      [jobId]
    );

    if (!jobs.length) {
      return res.status(404).json({ error: 'Job not found or inactive' });
    }

    // Check if already applied
    const [existing] = await db.execute(
      'SELECT id FROM job_applications WHERE job_id = ? AND applicant_id = ?',
      [jobId, applicantId]
    );

    if (existing.length) {
      return res.status(400).json({ error: 'Already applied for this job' });
    }

    // Create application
    await db.execute(
      `INSERT INTO job_applications (job_id, applicant_id, cover_letter)
       VALUES (?, ?, ?)`,
      [jobId, applicantId, coverLetter]
    );

    // Update applications count
    await db.execute(
      'UPDATE jobs SET applications_count = applications_count + 1 WHERE id = ?',
      [jobId]
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('Apply Job Error:', error);
    res.status(500).json({ error: 'Failed to apply for job' });
  }
};

/**
 * Get employer's posted jobs
 */
const getEmployerJobs = async (req, res) => {
  try {
    const employerId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const { offset } = paginate(page, limit);

    const sql = `SELECT 
     j.*,
     s.name as skill_name,
     (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as applications_count
    FROM jobs j
    LEFT JOIN skills s ON j.skill_id = s.id
    WHERE j.employer_id = ?
    ORDER BY j.created_at DESC
    LIMIT ${limit} OFFSET ${offset}`;

const [jobs] = await db.execute(sql, [employerId]);

    const [total] = await db.execute(
      'SELECT COUNT(*) as count FROM jobs WHERE employer_id = ?',
      [employerId]
    );

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].count,
        pages: Math.ceil(total[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Get Employer Jobs Error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
};

/**
 * Get job applications
 */
const getJobApplications = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const employerId = req.user.id;

    // Verify job belongs to employer
    const [jobs] = await db.execute(
      'SELECT id FROM jobs WHERE id = ? AND employer_id = ?',
      [jobId, employerId]
    );

    if (!jobs.length) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const [applications] = await db.execute(
      `SELECT 
        ja.*,
        u.id as applicant_id, u.name, u.profile_photo, u.area, u.city,
        u.experience_years, u.is_verified, u.exam_passed, u.availability,
        u.mobile
       FROM job_applications ja
       JOIN users u ON ja.applicant_id = u.id
       WHERE ja.job_id = ?
       ORDER BY 
         (u.is_verified = TRUE AND u.exam_passed = TRUE) DESC,
         u.is_verified DESC,
         u.exam_passed DESC,
         ja.applied_at ASC`,
      [jobId]
    );

    // Hide mobile if not subscribed
    if (req.user.subscription_status !== 'active') {
      applications.forEach(app => {
        app.mobile = null;
      });
    }

    res.json({ applications });
  } catch (error) {
    console.error('Get Applications Error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
};

/**
 * Update application status
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;

    // Verify application belongs to employer's job
    const [apps] = await db.execute(
      `SELECT ja.id FROM job_applications ja
       JOIN jobs j ON ja.job_id = j.id
       WHERE ja.id = ? AND j.employer_id = ?`,
      [applicationId, req.user.id]
    );

    if (!apps.length) {
      return res.status(404).json({ error: 'Application not found' });
    }

    await db.execute(
      `UPDATE job_applications SET status = ?, employer_notes = ? WHERE id = ?`,
      [status, notes, applicationId]
    );

    res.json({ success: true, message: 'Application updated' });
  } catch (error) {
    console.error('Update Application Error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
};

/**
 * Update job
 */
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify job belongs to employer
    const [jobs] = await db.execute(
      'SELECT id FROM jobs WHERE id = ? AND employer_id = ?',
      [id, req.user.id]
    );

    if (!jobs.length) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const allowedFields = [
      'title', 'description', 'skill_id', 'job_type', 'salary_min',
      'salary_max', 'salary_type', 'area', 'city', 'state', 'latitude',
      'longitude', 'radius_km', 'vacancies', 'availability_required',
      'experience_required', 'is_active', 'expires_at'
    ];

    const setClause = [];
    const params = [];

    for (const [key, value] of Object.entries(updates)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedFields.includes(snakeKey)) {
        setClause.push(`${snakeKey} = ?`);
        params.push(value);
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(id);
    await db.execute(
      `UPDATE jobs SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

    const [updatedJob] = await db.execute('SELECT * FROM jobs WHERE id = ?', [id]);

    res.json({
      success: true,
      job: updatedJob[0],
    });
  } catch (error) {
    console.error('Update Job Error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

/**
 * Delete job
 */
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify job belongs to employer
    const [result] = await db.execute(
      'DELETE FROM jobs WHERE id = ? AND employer_id = ?',
      [id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    console.error('Delete Job Error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

/**
 * Search candidates (for employers)
 */
const searchCandidates = async (req, res) => {
  try {
    const filters = req.query;
    const candidates = await matchingEngine.findCandidatesForEmployer(req.user, filters);

    res.json({ candidates });
  } catch (error) {
    console.error('Search Candidates Error:', error);
    res.status(500).json({ error: 'Failed to search candidates' });
  }
};

/**
 * Get recommended jobs for job seeker
 */
const getRecommendedJobs = async (req, res) => {
  try {
    const jobs = await matchingEngine.getRecommendations(req.user.id, 10);
    res.json({ jobs });
  } catch (error) {
    console.error('Get Recommendations Error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJob,
  applyForJob,
  getEmployerJobs,
  getJobApplications,
  updateApplicationStatus,
  updateJob,
  deleteJob,
  searchCandidates,
  getRecommendedJobs,
};