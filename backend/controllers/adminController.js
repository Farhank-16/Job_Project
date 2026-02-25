const db = require('../config/database');

/**
 * Safe pagination helper
 */
const getPagination = (queryPage, queryLimit) => {
  const page   = Math.max(1, parseInt(queryPage,  10) || 1);
  const limit  = Math.min(100, Math.max(1, parseInt(queryLimit, 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

// ─── IMPORTANT ───────────────────────────────────────────────────────────────
// We use db.query() (not db.execute()) for all dynamic paginated queries.
// db.execute() uses prepared statements which are strict about param types in
// some mysql2 versions. db.query() uses the regular text protocol and avoids
// ER_WRONG_ARGUMENTS entirely while still escaping values safely via `?`.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get dashboard stats
 */
const getDashboardStats = async (req, res) => {
  try {
    const [userStats] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'job_seeker' THEN 1 ELSE 0 END) as jobSeekers,
        SUM(CASE WHEN role = 'employer' THEN 1 ELSE 0 END) as employers,
        SUM(CASE WHEN subscription_status = 'active' THEN 1 ELSE 0 END) as activeSubscriptions,
        SUM(CASE WHEN is_verified = TRUE THEN 1 ELSE 0 END) as verifiedUsers,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as newThisWeek
      FROM users WHERE role != 'admin'
    `);

    const [jobStats] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active,
        SUM(applications_count) as totalApplications
      FROM jobs
    `);

    const [paymentStats] = await db.execute(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as totalRevenue,
        SUM(CASE WHEN status = 'completed' AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN amount ELSE 0 END) as monthlyRevenue
      FROM payments
    `);

    res.json({
      users: userStats[0],
      jobs: jobStats[0],
      payments: paymentStats[0],
    });
  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

/**
 * Get all users
 */
const getUsers = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const role   = req.query.role   || null;
    const search = req.query.search || null;

    let query = `
      SELECT id, mobile, name, email, role, area, city,
             is_verified, exam_passed, subscription_status,
             profile_completed, is_active, created_at
      FROM users WHERE role != 'admin'
    `;
    const params = [];

    if (role) {
      query += ` AND role = ?`;
      params.push(role);
    }
    if (search) {
      query += ` AND (name LIKE ? OR mobile LIKE ? OR city LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    // Use db.query() to avoid prepared-statement type issues with LIMIT/OFFSET
    const [users] = await db.query(query, params);

    let countQuery = `SELECT COUNT(*) as count FROM users WHERE role != 'admin'`;
    const countParams = [];
    if (role) {
      countQuery += ` AND role = ?`;
      countParams.push(role);
    }
    const [total] = await db.query(countQuery, countParams);

    res.json({
      users,
      pagination: {
        page,
        limit,
        total: total[0].count,
        pages: Math.ceil(total[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Get Users Error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
};

/**
 * Update user status
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, isVerified } = req.body;

    // Build UPDATE dynamically — only set fields that were actually provided.
    // This avoids passing undefined to mysql2 (it only accepts null for SQL NULL).
    const fields = [];
    const params = [];

    if (isActive !== undefined) {
      fields.push('is_active = ?');
      params.push(isActive);
    }
    if (isVerified !== undefined) {
      fields.push('is_verified = ?');
      params.push(isVerified);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    await db.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    await db.execute(
      `INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details)
       VALUES (?, 'update_user_status', 'user', ?, ?)`,
      [req.user.id, id, JSON.stringify({ isActive, isVerified })]
    );

    res.json({ success: true, message: 'User updated' });
  } catch (error) {
    console.error('Update User Status Error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

/**
 * Get all jobs (admin)
 */
const getAllJobs = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const status = req.query.status || null;
    const search = req.query.search || null;

    let query = `
      SELECT j.*, u.name as employer_name, s.name as skill_name
      FROM jobs j
      LEFT JOIN users u ON j.employer_id = u.id
      LEFT JOIN skills s ON j.skill_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (status === 'active') {
      query += ` AND j.is_active = TRUE`;
    } else if (status === 'inactive') {
      query += ` AND j.is_active = FALSE`;
    }

    if (search) {
      query += ` AND (j.title LIKE ? OR j.city LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY j.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [jobs] = await db.query(query, params);

    const [total] = await db.execute('SELECT COUNT(*) as count FROM jobs');

    res.json({
      jobs,
      pagination: {
        page,
        limit,
        total: total[0].count,
        pages: Math.ceil(total[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Get All Jobs Error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
};

/**
 * Get skills
 */
const getSkills = async (req, res) => {
  try {
    const [skills] = await db.execute(
      `SELECT s.*,
        (SELECT COUNT(*) FROM user_skills WHERE skill_id = s.id) as users_count,
        (SELECT COUNT(*) FROM jobs       WHERE skill_id = s.id) as jobs_count,
        (SELECT COUNT(*) FROM exams      WHERE skill_id = s.id) as questions_count
       FROM skills s ORDER BY s.name`
    );
    res.json({ skills });
  } catch (error) {
    console.error('Get Skills Error:', error);
    res.status(500).json({ error: 'Failed to get skills' });
  }
};

const createSkill = async (req, res) => {
  try {
    const { name, category, description, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Skill name required' });

    // undefined → null so mysql2 doesn't throw on optional fields
    const safeCategory    = category    ?? null;
    const safeDescription = description ?? null;
    const safeIcon        = icon        ?? null;

    const [result] = await db.execute(
      `INSERT INTO skills (name, category, description, icon) VALUES (?, ?, ?, ?)`,
      [name, safeCategory, safeDescription, safeIcon]
    );

    res.status(201).json({
      success: true,
      skill: { id: result.insertId, name, category: safeCategory, description: safeDescription, icon: safeIcon },
    });
  } catch (error) {
    console.error('Create Skill Error:', error);
    res.status(500).json({ error: 'Failed to create skill' });
  }
};

const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, icon, isActive } = req.body;

    // Build SET clause dynamically — skip fields that were not sent (undefined)
    const fields = [];
    const params = [];

    if (name        !== undefined) { fields.push('name = ?');        params.push(name); }
    if (category    !== undefined) { fields.push('category = ?');    params.push(category); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (icon        !== undefined) { fields.push('icon = ?');        params.push(icon); }
    if (isActive    !== undefined) { fields.push('is_active = ?');   params.push(isActive); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    await db.execute(
      `UPDATE skills SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ success: true, message: 'Skill updated' });
  } catch (error) {
    console.error('Update Skill Error:', error);
    res.status(500).json({ error: 'Failed to update skill' });
  }
};

/**
 * Exam questions
 */
const getQuestions = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const skillId = req.query.skillId ? Number(req.query.skillId) : null;

    let query = `
      SELECT e.*, s.name as skill_name
      FROM exams e
      LEFT JOIN skills s ON e.skill_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (skillId) {
      query += ` AND e.skill_id = ?`;
      params.push(skillId);
    }

    query += ` ORDER BY e.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [questions] = await db.query(query, params);

    let countQuery  = 'SELECT COUNT(*) as count FROM exams WHERE 1=1';
    const countParams = [];
    if (skillId) {
      countQuery += ` AND skill_id = ?`;
      countParams.push(skillId);
    }
    const [total] = await db.query(countQuery, countParams);

    res.json({
      questions,
      pagination: {
        page,
        limit,
        total: total[0].count,
        pages: Math.ceil(total[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Get Questions Error:', error);
    res.status(500).json({ error: 'Failed to get questions' });
  }
};

const createQuestion = async (req, res) => {
  try {
    const { skillId, question, optionA, optionB, optionC, optionD, correctOption, difficulty } = req.body;

    if (!skillId || !question || !optionA || !optionB || !optionC || !optionD || !correctOption) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const [result] = await db.execute(
      `INSERT INTO exams (skill_id, question, option_a, option_b, option_c, option_d, correct_option, difficulty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [skillId, question, optionA, optionB, optionC, optionD, correctOption, difficulty || 'medium']
    );

    res.status(201).json({ success: true, questionId: result.insertId });
  } catch (error) {
    console.error('Create Question Error:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, optionA, optionB, optionC, optionD, correctOption, difficulty, isActive } = req.body;

    // Build SET clause dynamically — skip fields that were not sent (undefined)
    const fields = [];
    const params = [];

    if (question      !== undefined) { fields.push('question = ?');       params.push(question); }
    if (optionA       !== undefined) { fields.push('option_a = ?');       params.push(optionA); }
    if (optionB       !== undefined) { fields.push('option_b = ?');       params.push(optionB); }
    if (optionC       !== undefined) { fields.push('option_c = ?');       params.push(optionC); }
    if (optionD       !== undefined) { fields.push('option_d = ?');       params.push(optionD); }
    if (correctOption !== undefined) { fields.push('correct_option = ?'); params.push(correctOption); }
    if (difficulty    !== undefined) { fields.push('difficulty = ?');     params.push(difficulty); }
    if (isActive      !== undefined) { fields.push('is_active = ?');      params.push(isActive); }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);
    await db.execute(
      `UPDATE exams SET ${fields.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ success: true, message: 'Question updated' });
  } catch (error) {
    console.error('Update Question Error:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM exams WHERE id = ?', [id]);
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Delete Question Error:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

/**
 * Get all payments
 */
const getPayments = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query.page, req.query.limit);
    const status = req.query.status || null;
    const type   = req.query.type   || null;

    let query = `
      SELECT p.*, u.name as user_name, u.mobile as user_mobile
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }
    if (type) {
      query += ` AND p.payment_type = ?`;
      params.push(type);
    }

    // Inline LIMIT/OFFSET as literals — bypasses prepared-statement type checks
    query += ` ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [payments] = await db.query(query, params);

    const [total] = await db.execute('SELECT COUNT(*) as count FROM payments');

    res.json({
      payments,
      pagination: {
        page,
        limit,
        total: total[0].count,
        pages: Math.ceil(total[0].count / limit),
      },
    });
  } catch (error) {
    console.error('Get Payments Error:', error);
    res.status(500).json({ error: 'Failed to get payments' });
  }
};

/**
 * Generate reports
 */
const generateReport = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;
    const start = startDate || '2020-01-01';
    const end   = endDate   || new Date().toISOString();

    let report = {};

    switch (type) {
      case 'users':
        const [userReport] = await db.execute(`
          SELECT DATE(created_at) as date, COUNT(*) as total,
            SUM(CASE WHEN role = 'job_seeker' THEN 1 ELSE 0 END) as job_seekers,
            SUM(CASE WHEN role = 'employer'   THEN 1 ELSE 0 END) as employers
          FROM users WHERE created_at BETWEEN ? AND ?
          GROUP BY DATE(created_at) ORDER BY date
        `, [start, end]);
        report = userReport;
        break;

      case 'revenue':
        const [revenueReport] = await db.execute(`
          SELECT DATE(created_at) as date, SUM(amount) as total_revenue,
            SUM(CASE WHEN payment_type = 'subscription'    THEN amount ELSE 0 END) as subscription_revenue,
            SUM(CASE WHEN payment_type = 'skill_exam'      THEN amount ELSE 0 END) as exam_revenue,
            SUM(CASE WHEN payment_type = 'verified_badge'  THEN amount ELSE 0 END) as badge_revenue
          FROM payments WHERE status = 'completed' AND created_at BETWEEN ? AND ?
          GROUP BY DATE(created_at) ORDER BY date
        `, [start, end]);
        report = revenueReport;
        break;

      case 'jobs':
        const [jobReport] = await db.execute(`
          SELECT DATE(created_at) as date, COUNT(*) as jobs_posted,
            SUM(applications_count) as total_applications
          FROM jobs WHERE created_at BETWEEN ? AND ?
          GROUP BY DATE(created_at) ORDER BY date
        `, [start, end]);
        report = jobReport;
        break;

      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Generate Report Error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getAllJobs,
  getSkills,
  createSkill,
  updateSkill,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getPayments,
  generateReport,
};