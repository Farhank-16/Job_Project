const express = require("express");
const router = express.Router();
const job = require("../controllers/jobController");
const { authenticate, optionalAuth } = require("../middleware/auth");
const {
  requireRole,
  requireSubscription,
  requireCompleteProfile,
} = require("../middleware/roleCheck");

const employer = [authenticate, requireRole("employer")];
const seeker = [authenticate, requireRole("job_seeker")];

// Static routes first — must come before /:id param routes
router.get("/my-jobs", ...employer, job.getEmployerJobs);
router.get("/recommended", ...seeker, job.getRecommendedJobs);
router.get("/candidates", ...employer, job.searchCandidates);
router.put(
  "/applications/:applicationId",
  ...employer,
  job.updateApplicationStatus,
);

router.get("/", optionalAuth, job.getJobs);
router.post("/", ...employer, requireCompleteProfile, job.createJob);

// Param routes last
router.get("/:id", optionalAuth, job.getJob);
router.put("/:id", ...employer, job.updateJob);
router.delete("/:id", ...employer, job.deleteJob);
router.post("/:id/apply", ...seeker, requireSubscription, job.applyForJob);
router.get("/:id/applications", ...employer, job.getJobApplications);

module.exports = router;