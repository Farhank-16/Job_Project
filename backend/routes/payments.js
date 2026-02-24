const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimit');

// Create subscription order
router.post('/subscription/create', authenticate, paymentLimiter, paymentController.createSubscriptionOrder);

// Create exam payment order
router.post('/exam/create', authenticate, paymentLimiter, paymentController.createExamOrder);

// Create verified badge order
router.post('/badge/create', authenticate, paymentLimiter, paymentController.createBadgeOrder);

// Verify payment
router.post('/verify', authenticate, paymentController.verifyPayment);

// Get payment history
router.get('/history', authenticate, paymentController.getPaymentHistory);

// Get subscription status
router.get('/subscription/status', authenticate, paymentController.getSubscriptionStatus);

module.exports = router;