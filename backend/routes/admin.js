const express = require("express");
const router = express.Router();
const admin = require("../controllers/adminController");
const { authenticate } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleCheck");

router.use(authenticate, requireRole("admin"));

router.get("/dashboard", admin.getDashboardStats);
router.get("/users", admin.getUsers);
router.put("/users/:id/status", admin.updateUserStatus);
router.get("/jobs", admin.getAllJobs);
router.get("/skills", admin.getSkills);
router.post("/skills", admin.createSkill);
router.put("/skills/:id", admin.updateSkill);
router.get("/questions", admin.getQuestions);
router.post("/questions", admin.createQuestion);
router.put("/questions/:id", admin.updateQuestion);
router.delete("/questions/:id", admin.deleteQuestion);
router.get("/payments", admin.getPayments);
router.get("/reports", admin.generateReport);

module.exports = router;