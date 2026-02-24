const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireRole, requireSubscription, requireCompleteProfile } = require('../middleware/roleCheck');

// Get all jobs (public with optional auth for distance)
router.get('/', optionalAuth, jobController.getJobs);

// Get recommended jobs (for logged in job seekers)
router.get('/recommended', authenticate, requireRole('job_seeker'), jobController.getRecommendedJobs);

// Search candidates (for employers)
router.get('/candidates', authenticate, requireRole('employer'), jobController.searchCandidates);

// Get employer's jobs
router.get('/my-jobs', authenticate, requireRole('employer'), jobController.getEmployerJobs);

// Get single job
router.get('/:id', optionalAuth, jobController.getJob);

// Create job (employer only)
router.post('/', authenticate, requireRole('employer'), requireCompleteProfile, jobController.createJob);

// Update job
router.put('/:id', authenticate, requireRole('employer'), jobController.updateJob);

// Delete job
router.delete('/:id', authenticate, requireRole('employer'), jobController.deleteJob);

// Apply for job (job seeker only, subscription required)
router.post('/:id/apply', authenticate, requireRole('job_seeker'), requireSubscription, jobController.applyForJob);

// Get job applications (employer only)
router.get('/:id/applications', authenticate, requireRole('employer'), jobController.getJobApplications);

// Update application status
router.put('/applications/:applicationId', authenticate, requireRole('employer'), jobController.updateApplicationStatus);

module.exports = router;