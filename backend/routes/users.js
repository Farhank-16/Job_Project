const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Update profile
router.put('/profile', authenticate, userController.updateProfile);

// Upload profile photo
router.post('/profile/photo', authenticate, upload.single('photo'), userController.uploadProfilePhoto);

// Get user profile by ID (public with optional auth)
router.get('/:id', optionalAuth, userController.getProfile);

// Get applied jobs (for job seekers)
router.get('/me/applications', authenticate, userController.getAppliedJobs);

// Update location
router.put('/location', authenticate, userController.updateLocation);

module.exports = router;