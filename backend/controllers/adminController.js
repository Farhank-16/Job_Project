const db = require('../config/database');
const { paginate } = require('../utils/helpers');

/**
 * Get dashboard stats - NOW INCLUDED
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
 * Get all users - FIXED
 */
const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const { offset } = paginate(page, limit);

    let query = `
      SELECT id, mobile, name, email, role, area, city, 
             is_verified, exam_passed, subscription_status, 
             profile_completed, is_active, created_at
      FROM users WHERE role != 'admin'
    `;
    const params = [];

    if (role && role !== '') {
      query += ` AND role = ?`;
      params.push(role);
    }

    if (search && search !== '') {
      query += ` AND (name LIKE ? OR mobile LIKE ? OR city LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [users] = await db.query(query, params); // FIXED: .query()

    let countQuery = `SELECT COUNT(*) as count FROM users WHERE role != 'admin'`;
    const countParams = [];
    if (role && role !== '') {
      countQuery += ` AND role = ?`;
      countParams.push(role);
    }
    const [total] = await db.query(countQuery, countParams);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].count,
        pages: Math.ceil(total[0].count / parseInt(limit)),
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

    // Validate user ID exists
    const [user] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.execute(
      `UPDATE users SET 
        is_active = ?, 
        is_verified = ?
       WHERE id = ?`,
      [isActive === 'true' || isActive === true, isVerified === 'true' || isVerified === true, id]
    );

    // Skip admin_logs if req.user missing (middleware issue)
    try {
      if (req.user && req.user.id) {
        await db.execute(
          `INSERT INTO admin_logs (admin_id, action, entity_type, entity_id, details)
           VALUES (?, 'update_user_status', 'user', ?, ?)`,
          [req.user.id, id, JSON.stringify({ isActive, isVerified })]
        );
      }
    } catch (logError) {
      console.log('Admin log failed (non-critical):', logError.message);
    }

    res.json({ success: true, message: 'User status updated' });
  } catch (error) {
    console.error('Update User Status Error:', error);
    res.status(500).json({ error: 'Failed to update user status', details: error.message });
  }
};
/**
 * Get all jobs - FIXED
 */
const getAllJobs = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const { offset } = paginate(page, limit);

    let query = `
      SELECT j.*, u.name as employer_name, s.name as skill_name
      FROM jobs j
      LEFT JOIN users u ON j.employer_id = u.id
      LEFT JOIN skills s ON j.skill_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== '' && ['active', 'inactive'].includes(status)) {
      query += ` AND j.is_active = ?`;
      params.push(status === 'active');
    }

    if (search && search !== '') {
      query += ` AND (j.title LIKE ? OR j.city LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY j.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [jobs] = await db.query(query, params); // FIXED: .query()

    let countQuery = `SELECT COUNT(*) as count FROM jobs WHERE 1=1`;
    const countParams = [];
    if (status && status !== '' && ['active', 'inactive'].includes(status)) {
      countQuery += ` AND is_active = ?`;
      countParams.push(status === 'active');
    }
    const [total] = await db.query(countQuery, countParams);

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
    console.error('Get All Jobs Error:', error);
    res.status(500).json({ error: 'Failed to get jobs' });
  }
};

/**
 * Manage skills
 */
const getSkills = async (req, res) => {
  try {
    const [skills] = await db.execute(
      `SELECT s.*, 
        (SELECT COUNT(*) FROM user_skills WHERE skill_id = s.id) as users_count,
        (SELECT COUNT(*) FROM jobs WHERE skill_id = s.id) as jobs_count,
        (SELECT COUNT(*) FROM exams WHERE skill_id = s.id) as questions_count
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

    if (!name) {
      return res.status(400).json({ error: 'Skill name required' });
    }

    const [result] = await db.execute(
      `INSERT INTO skills (name, category, description, icon) 
       VALUES (?, ?, ?, ?)`,
      [name, category || null, description || null, icon || null]
    );

    res.status(201).json({
      success: true,
      skill: { 
        id: result.insertId, 
        name, 
        category, 
        description, 
        icon 
      },
    });
  } catch (error) {
    console.error('Create Skill Error:', error);
    res.status(500).json({ error: 'Failed to create skill', details: error.message });
  }
};

/**
 * Update skill - FIXED column name & COALESCE issue
 */
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, icon, isActive } = req.body;

    // Validate skill exists
    const [skill] = await db.execute('SELECT id FROM skills WHERE id = ?', [id]);
    if (skill.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    await db.execute(
      `UPDATE skills SET 
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        description = COALESCE(?, description),
        icon = COALESCE(?, icon),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name || null, category || null, description || null, icon || null, isActive === 'true' || isActive === true || null, id]
    );

    res.json({ success: true, message: 'Skill updated successfully' });
  } catch (error) {
    console.error('Update Skill Error:', error);
    res.status(500).json({ error: 'Failed to update skill', details: error.message });
  }
};


/**
 * Manage exam questions - FIXED
 */
const getQuestions = async (req, res) => {
  try {
    const { skillId, page = 1, limit = 20 } = req.query;
    const { offset } = paginate(page, limit);

    let query = `
      SELECT e.*, s.name as skill_name
      FROM exams e
      LEFT JOIN skills s ON e.skill_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (skillId && skillId !== '') {
      query += ` AND e.skill_id = ?`;
      params.push(parseInt(skillId));
    }

    query += ` ORDER BY e.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [questions] = await db.query(query, params); // FIXED: .query()

    let countQuery = `SELECT COUNT(*) as count FROM exams WHERE 1=1`;
    const countParams = [];
    if (skillId && skillId !== '') {
      countQuery += ` AND skill_id = ?`;
      countParams.push(parseInt(skillId));
    }
    const [total] = await db.query(countQuery, countParams);

    res.json({
      questions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].count,
        pages: Math.ceil(total[0].count / parseInt(limit)),
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

    res.status(201).json({
      success: true,
      questionId: result.insertId,
    });
  } catch (error) {
    console.error('Create Question Error:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

/**
 * Update question - FIXED column names & param order
 */
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, optionA, optionB, optionC, optionD, correctOption, difficulty, isActive, skillId } = req.body;

    // Validate question exists
    const [exam] = await db.execute('SELECT id FROM exams WHERE id = ?', [id]);
    if (exam.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    await db.execute(
      `UPDATE exams SET 
        skill_id = COALESCE(?, skill_id),
        question = COALESCE(?, question),
        option_a = COALESCE(?, option_a),
        option_b = COALESCE(?, option_b),
        option_c = COALESCE(?, option_c),
        option_d = COALESCE(?, option_d),
        correct_option = COALESCE(?, correct_option),
        difficulty = COALESCE(?, difficulty),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        skillId || null,
        question || null, 
        optionA || null, 
        optionB || null, 
        optionC || null, 
        optionD || null, 
        correctOption || null, 
        difficulty || null, 
        isActive === 'true' || isActive === true || null, 
        id
      ]
    );

    res.json({ success: true, message: 'Question updated successfully' });
  } catch (error) {
    console.error('Update Question Error:', error);
    res.status(500).json({ error: 'Failed to update question', details: error.message });
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
 * Get all payments - FIXED
 */
const getPayments = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const { offset } = paginate(page, limit);

    let query = `
      SELECT p.*, u.name as user_name, u.mobile as user_mobile
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== '') {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    if (type && type !== '') {
      query += ` AND p.payment_type = ?`;
      params.push(type);
    }

    query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), offset);

    const [payments] = await db.query(query, params); // FIXED: .query()

    let countQuery = `SELECT COUNT(*) as count FROM payments WHERE 1=1`;
    const countParams = [];
    if (status && status !== '') {
      countQuery += ` AND status = ?`;
      countParams.push(status);
    }
    if (type && type !== '') {
      countQuery += ` AND payment_type = ?`;
      countParams.push(type);
    }
    const [total] = await db.query(countQuery, countParams);

    res.json({
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total[0].count,
        pages: Math.ceil(total[0].count / parseInt(limit)),
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

    let report = {};

    switch (type) {
      case 'users':
        const [userReport] = await db.execute(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as total,
            SUM(CASE WHEN role = 'job_seeker' THEN 1 ELSE 0 END) as job_seekers,
            SUM(CASE WHEN role = 'employer' THEN 1 ELSE 0 END) as employers
          FROM users
          WHERE created_at BETWEEN ? AND ?
          GROUP BY DATE(created_at)
          ORDER BY date
        `, [startDate || '2020-01-01', endDate || new Date().toISOString()]);
        report = userReport;
        break;

      case 'revenue':
        const [revenueReport] = await db.execute(`
          SELECT 
            DATE(created_at) as date,
            SUM(amount) as total_revenue,
            SUM(CASE WHEN payment_type = 'subscription' THEN amount ELSE 0 END) as subscription_revenue,
            SUM(CASE WHEN payment_type = 'skill_exam' THEN amount ELSE 0 END) as exam_revenue,
            SUM(CASE WHEN payment_type = 'verified_badge' THEN amount ELSE 0 END) as badge_revenue
          FROM payments
          WHERE status = 'completed' AND created_at BETWEEN ? AND ?
          GROUP BY DATE(created_at)
          ORDER BY date
        `, [startDate || '2020-01-01', endDate || new Date().toISOString()]);
        report = revenueReport;
        break;

      case 'jobs':
        const [jobReport] = await db.execute(`
          SELECT 
            DATE(created_at) as date,
            COUNT(*) as jobs_posted,
            SUM(applications_count) as total_applications
          FROM jobs
          WHERE created_at BETWEEN ? AND ?
          GROUP BY DATE(created_at)
          ORDER BY date
        `, [startDate || '2020-01-01', endDate || new Date().toISOString()]);
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
