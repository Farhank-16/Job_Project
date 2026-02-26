const express = require("express");
const router = express.Router();
const payment = require("../controllers/paymentController");
const { authenticate } = require("../middleware/auth");
const { paymentLimiter } = require("../middleware/rateLimit");

const auth = [authenticate];
const authLimited = [authenticate, paymentLimiter];

router.post(
  "/subscription/create",
  ...authLimited,
  payment.createSubscriptionOrder,
);
router.post("/exam/create", ...authLimited, payment.createExamOrder);
router.post("/badge/create", ...authLimited, payment.createBadgeOrder);
router.post("/verify", ...auth, payment.verifyPayment);
router.get("/history", ...auth, payment.getPaymentHistory);
router.get("/subscription/status", ...auth, payment.getSubscriptionStatus);

module.exports = router;