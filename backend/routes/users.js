const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Update profile
router.put('/profile', authenticate, userController.updateProfile);

// Get applied jobs — MUST be before /:id
router.get('/me/applications', authenticate, userController.getAppliedJobs);

// Update location
router.put('/location', authenticate, userController.updateLocation);

// Get public profile by ID — LAST
router.get('/:id', optionalAuth, userController.getProfile);

module.exports = router;