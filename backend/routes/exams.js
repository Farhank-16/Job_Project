const express = require("express");
const router = express.Router();
const exam = require("../controllers/examController");
const { authenticate, optionalAuth } = require("../middleware/auth");

// Static routes MUST come before param routes to avoid '/:skillId' catching them
router.get("/history", authenticate, exam.getExamHistory);
router.get("/", optionalAuth, exam.getAvailableExams);
router.get("/:skillId/start", authenticate, exam.startExam);
router.post("/attempt/:attemptId/submit", authenticate, exam.submitExam);

module.exports = router;
