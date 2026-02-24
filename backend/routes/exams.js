const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Get available exams
router.get('/', optionalAuth, examController.getAvailableExams);

// Start exam
router.get('/:skillId/start', authenticate, examController.startExam);

// Submit exam
router.post('/attempt/:attemptId/submit', authenticate, examController.submitExam);

// Get exam history
router.get('/history', authenticate, examController.getExamHistory);

module.exports = router;