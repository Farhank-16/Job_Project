const db = require('../config/database');
const config = require('../config/config');

// Minimum questions required — lower in dev so you can test with fewer questions
const MIN_QUESTIONS = config.nodeEnv === 'development' ? 1 : 10;
// Exam length — how many questions per attempt
const EXAM_LENGTH   = config.nodeEnv === 'development' ? 1 : 10;
// Pass mark — number of correct answers needed
const PASS_MARK     = config.nodeEnv === 'development' ? 1 : 6;

/**
 * Get available exams
 */
const getAvailableExams = async (req, res) => {
  try {
    const [skills] = await db.execute(
      `SELECT 
        s.id, s.name, s.category, s.description,
        (SELECT COUNT(*) FROM exams WHERE skill_id = s.id AND is_active = TRUE) AS question_count
       FROM skills s
       WHERE s.is_active = TRUE
       HAVING question_count >= ?
       ORDER BY s.name`,
      [MIN_QUESTIONS]
    );

    if (!skills.length) {
      return res.json({ exams: [] });
    }

    let userSkillIds  = new Set();
    let passedSkillIds = new Set();

    if (req.user) {
      const [userSkills] = await db.execute(
        'SELECT skill_id FROM user_skills WHERE user_id = ?',
        [req.user.id]
      );
      userSkillIds = new Set(userSkills.map(s => s.skill_id));

      const [passed] = await db.execute(
        'SELECT skill_id FROM exam_attempts WHERE user_id = ? AND passed = TRUE',
        [req.user.id]
      );
      passedSkillIds = new Set(passed.map(p => p.skill_id));
    }

    const enriched = skills.map(skill => ({
      ...skill,
      passed:    passedSkillIds.has(skill.id),
      isMySkill: userSkillIds.has(skill.id),
    }));

    // User's own skills first, then others
    enriched.sort((a, b) => {
      if (a.isMySkill && !b.isMySkill) return -1;
      if (!a.isMySkill && b.isMySkill) return 1;
      return a.name.localeCompare(b.name);
    });

    res.json({ exams: enriched });
  } catch (error) {
    console.error('Get Available Exams Error:', error);
    res.status(500).json({ error: 'Failed to get exams' });
  }
};

/**
 * Start an exam
 */
const startExam = async (req, res) => {
  try {
    const { skillId } = req.params;
    const userId = req.user.id;

    if (req.user.subscription_status !== 'active') {
      return res.status(403).json({
        error: 'Subscription required',
        message: 'Please subscribe to take skill exams',
        code: 'SUBSCRIPTION_REQUIRED',
      });
    }

    // Check skill exists and has enough questions
    const [skillCheck] = await db.execute(
      `SELECT s.id, s.name,
        (SELECT COUNT(*) FROM exams WHERE skill_id = s.id AND is_active = TRUE) AS question_count
       FROM skills s WHERE s.id = ? AND s.is_active = TRUE`,
      [skillId]
    );

    if (!skillCheck.length || skillCheck[0].question_count < MIN_QUESTIONS) {
      return res.status(404).json({ error: 'Exam not available for this skill' });
    }

    // Check for existing unpaid/incomplete attempt
    const [attempts] = await db.execute(
      `SELECT * FROM exam_attempts
       WHERE user_id = ? AND skill_id = ? AND completed_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
      [userId, skillId]
    );

    if (!attempts.length) {
      return res.status(403).json({
        error: 'Payment required',
        message: 'Please pay for the exam first',
        code: 'PAYMENT_REQUIRED',
      });
    }

    const attempt = attempts[0];

    // Resume: questions already loaded
    if (attempt.questions_data) {
      const questions = JSON.parse(attempt.questions_data);
      return res.json({
        attemptId: attempt.id,
        questions: questions.map(q => ({
          id:      q.id,
          question: q.question,
          optionA: q.option_a,
          optionB: q.option_b,
          optionC: q.option_c,
          optionD: q.option_d,
        })),
        timeLimit: 15 * 60,
      });
    }

    // Get random questions (EXAM_LENGTH or all available if fewer)
    const [questions] = await db.execute(
      `SELECT id, question, option_a, option_b, option_c, option_d, correct_option
       FROM exams
       WHERE skill_id = ? AND is_active = TRUE
       ORDER BY RAND()
       LIMIT ?`,
      [skillId, EXAM_LENGTH]
    );

    if (questions.length < MIN_QUESTIONS) {
      return res.status(400).json({ error: 'Not enough questions available for this skill' });
    }

    await db.execute(
      `UPDATE exam_attempts SET questions_data = ?, started_at = NOW() WHERE id = ?`,
      [JSON.stringify(questions), attempt.id]
    );

    res.json({
      attemptId: attempt.id,
      questions: questions.map(q => ({
        id:      q.id,
        question: q.question,
        optionA: q.option_a,
        optionB: q.option_b,
        optionC: q.option_c,
        optionD: q.option_d,
      })),
      timeLimit: 15 * 60,
    });
  } catch (error) {
    console.error('Start Exam Error:', error);
    res.status(500).json({ error: 'Failed to start exam' });
  }
};

/**
 * Submit exam answers
 */
const submitExam = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers }   = req.body;
    const userId = req.user.id;

    const [attempts] = await db.execute(
      `SELECT * FROM exam_attempts WHERE id = ? AND user_id = ? AND completed_at IS NULL`,
      [attemptId, userId]
    );

    if (!attempts.length) {
      return res.status(404).json({ error: 'Exam attempt not found or already completed' });
    }

    const attempt   = attempts[0];
    const questions = JSON.parse(attempt.questions_data);

    let score = 0;
    const results = [];

    for (const question of questions) {
      const userAnswer = answers[question.id];
      const isCorrect  = userAnswer === question.correct_option;
      if (isCorrect) score++;
      results.push({
        questionId:    question.id,
        userAnswer,
        correctAnswer: question.correct_option,
        isCorrect,
      });
    }

    const passed = score >= Math.min(PASS_MARK, questions.length);

    await db.execute(
      `UPDATE exam_attempts SET
        answers_data = ?, score = ?, passed = ?, completed_at = NOW()
       WHERE id = ?`,
      [JSON.stringify(answers), score, passed, attemptId]
    );

    if (passed) {
      await db.execute('UPDATE users SET exam_passed = TRUE WHERE id = ?', [userId]);
    }

    res.json({
      success: true,
      score,
      totalQuestions: questions.length,
      passed,
      percentage: Math.round((score / questions.length) * 100),
      results,
      message: passed
        ? 'Congratulations! You passed the exam.'
        : 'You did not pass. You can try again.',
    });
  } catch (error) {
    console.error('Submit Exam Error:', error);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
};

/**
 * Get exam history
 */
const getExamHistory = async (req, res) => {
  try {
    const [attempts] = await db.execute(
      `SELECT ea.*, s.name AS skill_name
       FROM exam_attempts ea
       JOIN skills s ON ea.skill_id = s.id
       WHERE ea.user_id = ? AND ea.completed_at IS NOT NULL
       ORDER BY ea.completed_at DESC`,
      [req.user.id]
    );

    res.json({
      attempts: attempts.map(a => ({
        id:             a.id,
        skillId:        a.skill_id,
        skillName:      a.skill_name,
        score:          a.score,
        totalQuestions: a.total_questions || questions?.length || 10,
        passed:         !!a.passed,
        completedAt:    a.completed_at,
        percentage:     Math.round((a.score / (a.total_questions || 10)) * 100),
      })),
    });
  } catch (error) {
    console.error('Get Exam History Error:', error);
    res.status(500).json({ error: 'Failed to get exam history' });
  }
};

module.exports = { getAvailableExams, startExam, submitExam, getExamHistory };