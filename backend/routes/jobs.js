const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireRole, requireSubscription, requireCompleteProfile } = require('../middleware/roleCheck');


// Get employer's own posted jobs
router.get('/my-jobs', authenticate, requireRole('employer'), jobController.getEmployerJobs);

// Get recommended jobs (job seekers)
router.get('/recommended', authenticate, requireRole('job_seeker'), jobController.getRecommendedJobs);

// Search candidates (employers)
router.get('/candidates', authenticate, requireRole('employer'), jobController.searchCandidates);

// Update application status — MUST be before /:id to avoid 'applications' being treated as an ID
router.put('/applications/:applicationId', authenticate, requireRole('employer'), jobController.updateApplicationStatus);

// Get all jobs (public)
router.get('/', optionalAuth, jobController.getJobs);

// Create job (employer only)
router.post('/', authenticate, requireRole('employer'), requireCompleteProfile, jobController.createJob);

// ── Param routes below — these must come LAST ────────────────────────────────

// Get single job by ID
router.get('/:id', optionalAuth, jobController.getJob);

// Update job
router.put('/:id', authenticate, requireRole('employer'), jobController.updateJob);

// Delete job
router.delete('/:id', authenticate, requireRole('employer'), jobController.deleteJob);

// Apply for job
router.post('/:id/apply', authenticate, requireRole('job_seeker'), requireSubscription, jobController.applyForJob);

// Get applications for a specific job
router.get('/:id/applications', authenticate, requireRole('employer'), jobController.getJobApplications);

module.exports = router;