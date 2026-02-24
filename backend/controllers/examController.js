const db = require('../config/database');

/**
 * Get available exams (skills with questions)
 */
const getAvailableExams = async (req, res) => {
  try {
    const [skills] = await db.execute(
      `SELECT s.id, s.name, s.category, s.description,
        (SELECT COUNT(*) FROM exams WHERE skill_id = s.id AND is_active = TRUE) as question_count
       FROM skills s
       WHERE s.is_active = TRUE
       HAVING question_count >= 10
       ORDER BY s.name`
    );

    // Check user's exam status for each skill
    if (req.user) {
      for (const skill of skills) {
        const [attempts] = await db.execute(
          `SELECT passed FROM exam_attempts 
           WHERE user_id = ? AND skill_id = ? AND passed = TRUE
           LIMIT 1`,
          [req.user.id, skill.id]
        );
        skill.passed = attempts.length > 0;
      }
    }

    res.json({ exams: skills });
  } catch (error) {
    console.error('Get Available Exams Error:', error);
    res.status(500).json({ error: 'Failed to get exams' });
  }
};

/**
 * Start an exam (get questions)
 */
const startExam = async (req, res) => {
  try {
    const { skillId } = req.params;
    const userId = req.user.id;

    // Check if user has paid for this exam
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

    // If questions already loaded, return them
    if (attempt.questions_data) {
      const questions = JSON.parse(attempt.questions_data);
      res.json({
        attemptId: attempt.id,
        questions: questions.map(q => ({
          id: q.id,
          question: q.question,
          optionA: q.option_a,
          optionB: q.option_b,
          optionC: q.option_c,
          optionD: q.option_d,
        })),
        timeLimit: 15 * 60, // 15 minutes in seconds
      });
      return;
    }

    // Get 10 random questions
    const [questions] = await db.execute(
      `SELECT id, question, option_a, option_b, option_c, option_d, correct_option
       FROM exams 
       WHERE skill_id = ? AND is_active = TRUE
       ORDER BY RAND()
       LIMIT 10`,
      [skillId]
    );

    if (questions.length < 10) {
      return res.status(400).json({ error: 'Not enough questions available' });
    }

    // Store questions in attempt
    await db.execute(
      `UPDATE exam_attempts SET questions_data = ?, started_at = NOW() WHERE id = ?`,
      [JSON.stringify(questions), attempt.id]
    );

    res.json({
      attemptId: attempt.id,
      questions: questions.map(q => ({
        id: q.id,
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
    const { answers } = req.body; // { questionId: 'a' | 'b' | 'c' | 'd' }
    const userId = req.user.id;

    // Get attempt
    const [attempts] = await db.execute(
      `SELECT * FROM exam_attempts WHERE id = ? AND user_id = ? AND completed_at IS NULL`,
      [attemptId, userId]
    );

    if (!attempts.length) {
      return res.status(404).json({ error: 'Exam attempt not found or already completed' });
    }

    const attempt = attempts[0];
    const questions = JSON.parse(attempt.questions_data);

    // Calculate score
    let score = 0;
    const results = [];

    for (const question of questions) {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correct_option;
      if (isCorrect) score++;

      results.push({
        questionId: question.id,
        userAnswer,
        correctAnswer: question.correct_option,
        isCorrect,
      });
    }

    const passed = score >= 6; // 60% pass mark

    // Update attempt
    await db.execute(
      `UPDATE exam_attempts SET 
        answers_data = ?, score = ?, passed = ?, completed_at = NOW()
       WHERE id = ?`,
      [JSON.stringify(answers), score, passed, attemptId]
    );

    // If passed, update user
    if (passed) {
      await db.execute(
        `UPDATE users SET exam_passed = TRUE WHERE id = ?`,
        [userId]
      );
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
        : 'Unfortunately, you did not pass. You can try again.',
    });
  } catch (error) {
    console.error('Submit Exam Error:', error);
    res.status(500).json({ error: 'Failed to submit exam' });
  }
};

/**
 * Get user's exam history
 */
const getExamHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const [attempts] = await db.execute(
      `SELECT ea.*, s.name as skill_name
       FROM exam_attempts ea
       JOIN skills s ON ea.skill_id = s.id
       WHERE ea.user_id = ? AND ea.completed_at IS NOT NULL
       ORDER BY ea.completed_at DESC`,
      [userId]
    );

    res.json({
      attempts: attempts.map(a => ({
        id: a.id,
        skillId: a.skill_id,
        skillName: a.skill_name,
        score: a.score,
        totalQuestions: a.total_questions,
        passed: a.passed,
        completedAt: a.completed_at,
        percentage: Math.round((a.score / a.total_questions) * 100),
      })),
    });
  } catch (error) {
    console.error('Get Exam History Error:', error);
    res.status(500).json({ error: 'Failed to get exam history' });
  }
};

module.exports = {
  getAvailableExams,
  startExam,
  submitExam,
  getExamHistory,
};