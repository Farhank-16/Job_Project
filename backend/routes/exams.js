const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// FIX: Static routes MUST come before param routes
// '/history' was being caught by '/:skillId/start' — Express treated 'history' as skillId

// Get exam history — static, must be FIRST
router.get('/history', authenticate, examController.getExamHistory);

// Get available exams — shows user's skill-matched exams
router.get('/', optionalAuth, examController.getAvailableExams);

// Start exam — param route, comes AFTER static routes
router.get('/:skillId/start', authenticate, examController.startExam);

// Submit exam
router.post('/attempt/:attemptId/submit', authenticate, examController.submitExam);

module.exports = router;