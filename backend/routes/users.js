const express  = require('express');
const router   = express.Router();
const user     = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Static routes first — must come before /:id
router.put('/profile',          authenticate, user.updateProfile);
router.get('/me/applications',  authenticate, user.getAppliedJobs);
router.put('/location',         authenticate, user.updateLocation);

// Param route last
router.get('/:id', optionalAuth, user.getProfile);

module.exports = router;