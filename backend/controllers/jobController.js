const db = require('../config/database');
const matchingEngine = require('../services/matchingEngine');
const { getDistanceSQL, getMaxRadius } = require('../utils/haversine');

const getPagination = (queryPage, queryLimit, defaultLimit = 10) => {
  const page   = Math.max(1, parseInt(queryPage,  10) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(queryLimit, 10) || defaultLimit));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

/**
 * Create a new job
 */
const createJob = async (req, res) => {
  try {
    const employerId = req.user.id;
    const {
      title, description, skillId, jobType,
      salaryMin, salaryMax, salaryType,
      area, city, state, latitude, longitude,
      radiusKm, vacancies, availabilityRequired,
      experienceRequired, expiresAt,
    } = req.body;

    if (!title) return res.status(400).json({ error: 'Job title is required' });

    const [result] = await db.execute(
      `INSERT INTO jobs (
        employer_id, title, description, skill_id, job_type,
        salary_min, salary_max, salary_type, area, city, state,
        latitude, longitude, radius_km, vacancies,
        availability_required, experience_required, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employerId, title, description ?? null, skillId ?? null, jobType || 'full_time',
        salaryMin ?? null, salaryMax ?? null, salaryType || 'monthly',
        area ?? null, city ?? null, state ?? null,
        latitude ?? req.user.latitude ?? null,
        longitude ?? req.user.longitude ?? null,
        radiusKm || 10, vacancies || 1,
        availabilityRequired || 'flexible',
        experienceRequired || 0,
        expiresAt ?? null,
      ]
    );

    const [job] = await db.execute('SELECT * FROM jobs WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, message: 'Job created successfully', job: job[0] });
  } catch (error) {
    console.error('Create Job Error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
};

/**
 * Get all jobs with filters
 * FIX: Removed employer_photo from SELECT — not needed, frontend uses NameAvatar
 * FIX: Added j. prefix on latitude/longitude to avoid ambiguous column error
 */
const getJobs = async (req, res) => {
  try {
    const { skillId, city, radius = 10, jobType } = req.query;
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);

    let query = `
      SELECT 
        j.*,
        s.name  AS skill_name,
        u.name  AS employer_name,
        u.is_verified AS employer_verified
      FROM jobs j
      LEFT JOIN skills s ON j.skill_id = s.id
      LEFT JOIN users u ON j.employer_id = u.id
      WHERE j.is_active = TRUE
        AND (j.expires_at IS NULL OR j.expires_at > NOW())
    `;
    const params = [];

    if (skillId) { query += ` AND j.skill_id = ?`;       params.push(Number(skillId)); }
    if (city)    { query += ` AND j.city LIKE ?`;         params.push(`%${city}%`); }
    if (jobType) { query += ` AND j.job_type = ?`;        params.push(jobType); }

    if (req.user?.latitude && req.user?.longitude) {
      const maxRadius  = Math.min(Number(radius), getMaxRadius(req.user.subscription_status));
      // FIX: pass 'j' alias so haversine uses j.latitude, j.longitude (not ambiguous)
      const distSQL    = getDistanceSQL(req.user.latitude, req.user.longitude, 'j');
      query += ` AND ${distSQL} <= ?`;
      params.push(maxRadius);
      query += ` ORDER BY ${distSQL} ASC`;
    } else {
      query += ` ORDER BY j.created_at DESC`;
    }

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [jobs] = await db.query(query, params);

    let countQuery  = `SELECT COUNT(*) as count FROM jobs j
                       WHERE j.is_active = TRUE AND (j.expires_at IS NULL OR j.expires_at > NOW())`;
    const countParams = [];
    if (skillId) { countQuery += ` AND j.skill_id = ?`; countParams.push(Number(skillId)); }

    const [total] = await db.query(countQuery, countParams);

    res.json({
      jobs,
      pagination: { page, limit, total: total[0].count, pages: Math.ceil(total[0].count / limit) },
    });
  } catch (error) {
    console.error('Get Jobs Error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
};

/**
 * Get single job by ID
 * FIX: Removed employer_photo — frontend uses NameAvatar
 * FIX: Added j. prefix on all potentially ambiguous columns
 */
const getJob = async (req, res) => {
  try {
    const { id } = req.params;

    const [jobs] = await db.execute(
      `SELECT 
        j.*,
        s.name        AS skill_name,
        u.name        AS employer_name,
        u.mobile      AS employer_mobile,
        u.is_verified AS employer_verified
       FROM jobs j
       LEFT JOIN skills s ON j.skill_id = s.id
       LEFT JOIN users u  ON j.employer_id = u.id
       WHERE j.id = ?`,
      [id]
    );

    if (!jobs.length) return res.status(404).json({ error: 'Job not found' });

    const job = jobs[0];

    await db.execute('UPDATE jobs SET views_count = views_count + 1 WHERE id = ?', [id]);

    let hasApplied = false;
    if (req.user?.role === 'job_seeker') {
      const [apps] = await db.execute(
        'SELECT id FROM job_applications WHERE job_id = ? AND applicant_id = ?',
        [id, req.user.id]
      );
      hasApplied = apps.length > 0;
    }

    if (!req.user || req.user.subscription_status !== 'active') {
      job.employer_mobile = null;
    }

    res.json({
      ...job,
      hasApplied,
      canApply: req.user?.role === 'job_seeker' && req.user?.subscription_status === 'active',
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

    if (req.user.subscription_status !== 'active') {
      return res.status(403).json({ error: 'Subscription required', code: 'SUBSCRIPTION_REQUIRED' });
    }

    const [jobs] = await db.execute('SELECT id FROM jobs WHERE id = ? AND is_active = TRUE', [jobId]);
    if (!jobs.length) return res.status(404).json({ error: 'Job not found or inactive' });

    const [existing] = await db.execute(
      'SELECT id FROM job_applications WHERE job_id = ? AND applicant_id = ?',
      [jobId, applicantId]
    );
    if (existing.length) return res.status(400).json({ error: 'Already applied for this job' });

    await db.execute(
      `INSERT INTO job_applications (job_id, applicant_id, cover_letter) VALUES (?, ?, ?)`,
      [jobId, applicantId, coverLetter ?? null]
    );
    await db.execute('UPDATE jobs SET applications_count = applications_count + 1 WHERE id = ?', [jobId]);

    res.status(201).json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Apply Job Error:', error);
    res.status(500).json({ error: 'Failed to apply for job' });
  }
};

/**
 * Get employer's posted jobs
 * FIX: Removed skill_id single-join — employer dashboard doesn't need skill display
 */
const getEmployerJobs = async (req, res) => {
  try {
    const employerId = req.user.id;
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);

    const [jobs] = await db.query(
      `SELECT 
        j.*,
        s.name AS skill_name,
        (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) AS applications_count
       FROM jobs j
       LEFT JOIN skills s ON j.skill_id = s.id
       WHERE j.employer_id = ?
       ORDER BY j.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      [employerId]
    );

    const [total] = await db.execute(
      'SELECT COUNT(*) as count FROM jobs WHERE employer_id = ?',
      [employerId]
    );

    res.json({
      jobs,
      pagination: { page, limit, total: total[0].count, pages: Math.ceil(total[0].count / limit) },
    });
  } catch (error) {
    console.error('Get Employer Jobs Error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
};

/**
 * Get job applications (employer view)
 * FIX: Removed profile_photo from SELECT — frontend uses NameAvatar
 */
const getJobApplications = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const employerId = req.user.id;

    const [jobs] = await db.execute(
      'SELECT id FROM jobs WHERE id = ? AND employer_id = ?',
      [jobId, employerId]
    );
    if (!jobs.length) return res.status(404).json({ error: 'Job not found' });

    const [applications] = await db.execute(
      `SELECT 
        ja.*,
        u.id   AS applicant_id,
        u.name, u.area, u.city,
        u.experience_years, u.is_verified, u.exam_passed,
        u.availability, u.mobile
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

    if (req.user.subscription_status !== 'active') {
      applications.forEach(app => { app.mobile = null; });
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

    const [apps] = await db.execute(
      `SELECT ja.id FROM job_applications ja
       JOIN jobs j ON ja.job_id = j.id
       WHERE ja.id = ? AND j.employer_id = ?`,
      [applicationId, req.user.id]
    );
    if (!apps.length) return res.status(404).json({ error: 'Application not found' });

    await db.execute(
      `UPDATE job_applications SET status = ?, employer_notes = ? WHERE id = ?`,
      [status, notes ?? null, applicationId]
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

    const [jobs] = await db.execute(
      'SELECT id FROM jobs WHERE id = ? AND employer_id = ?',
      [id, req.user.id]
    );
    if (!jobs.length) return res.status(404).json({ error: 'Job not found' });

    const allowedFields = [
      'title', 'description', 'skill_id', 'job_type', 'salary_min',
      'salary_max', 'salary_type', 'area', 'city', 'state', 'latitude',
      'longitude', 'radius_km', 'vacancies', 'availability_required',
      'experience_required', 'is_active', 'expires_at',
    ];

    const setClause = [];
    const params    = [];

    for (const [key, value] of Object.entries(req.body)) {
      const snakeKey = key.replace(/[A-Z]/g, l => `_${l.toLowerCase()}`);
      if (allowedFields.includes(snakeKey)) {
        setClause.push(`${snakeKey} = ?`);
        params.push(value);
      }
    }

    if (!setClause.length) return res.status(400).json({ error: 'No valid fields to update' });

    params.push(id);
    await db.execute(`UPDATE jobs SET ${setClause.join(', ')} WHERE id = ?`, params);

    const [updatedJob] = await db.execute('SELECT * FROM jobs WHERE id = ?', [id]);
    res.json({ success: true, job: updatedJob[0] });
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
    const [result] = await db.execute(
      'DELETE FROM jobs WHERE id = ? AND employer_id = ?',
      [id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Job not found' });
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    console.error('Delete Job Error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

/**
 * Search candidates
 */
const searchCandidates = async (req, res) => {
  try {
    const candidates = await matchingEngine.findCandidatesForEmployer(req.user, req.query);
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
  createJob, getJobs, getJob, applyForJob,
  getEmployerJobs, getJobApplications, updateApplicationStatus,
  updateJob, deleteJob, searchCandidates, getRecommendedJobs,
};