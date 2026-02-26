const db = require('../config/database');
const config = require('../config/config');
const razorpayService = require('../services/razorpay');
const { generateOrderId } = require('../utils/helpers');

const createSubscriptionOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const [subs] = await db.execute(
      `SELECT id FROM subscriptions WHERE user_id = ? AND status = 'active' AND end_date > NOW()`,
      [userId]
    );

    const isFirstMonth = subs.length === 0;
    const amount  = razorpayService.getSubscriptionPrice(isFirstMonth);
    const order   = await razorpayService.createOrder(amount, generateOrderId('SUB'), {
      user_id: userId.toString(), type: 'subscription',
    });

    await db.execute(
      `INSERT INTO payments (user_id, payment_type, amount, razorpay_order_id, status, metadata)
       VALUES (?, 'subscription', ?, ?, 'created', ?)`,
      [userId, amount / 100, order.id, JSON.stringify({ isFirstMonth })]
    );

    res.json({
      success: true,
      order: { id: order.id, amount: order.amount, currency: order.currency },
      key: config.razorpay.keyId,
      isFirstMonth,
      displayAmount: `₹${amount / 100}`,
    });
  } catch (error) {
    console.error('Create Subscription Order Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

const createExamOrder = async (req, res) => {
  try {
    const userId  = req.user.id;
    const skillId = req.body.skillId;

    if (!skillId) return res.status(400).json({ error: 'Skill ID required' });

    const [skills] = await db.execute('SELECT id, name FROM skills WHERE id = ?', [skillId]);
    if (!skills.length) return res.status(404).json({ error: 'Skill not found' });

    const amount = config.prices.skillExam;
    const order  = await razorpayService.createOrder(amount, generateOrderId('EXAM'), {
      user_id: userId.toString(), type: 'skill_exam', skill_id: skillId.toString(),
    });

    await db.execute(
      `INSERT INTO payments (user_id, payment_type, amount, razorpay_order_id, status, metadata)
       VALUES (?, 'skill_exam', ?, ?, 'created', ?)`,
      [userId, amount / 100, order.id, JSON.stringify({ skillId })]
    );

    res.json({
      success: true,
      order: { id: order.id, amount: order.amount, currency: order.currency },
      key: config.razorpay.keyId,
      skill: skills[0],
      displayAmount: `₹${amount / 100}`,
    });
  } catch (error) {
    console.error('Create Exam Order Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

const createBadgeOrder = async (req, res) => {
  try {
    if (req.user.is_verified) return res.status(400).json({ error: 'Already verified' });

    const amount = config.prices.verifiedBadge;
    const order  = await razorpayService.createOrder(amount, generateOrderId('BADGE'), {
      user_id: req.user.id.toString(), type: 'verified_badge',
    });

    await db.execute(
      `INSERT INTO payments (user_id, payment_type, amount, razorpay_order_id, status)
       VALUES (?, 'verified_badge', ?, ?, 'created')`,
      [req.user.id, amount / 100, order.id]
    );

    res.json({
      success: true,
      order: { id: order.id, amount: order.amount, currency: order.currency },
      key: config.razorpay.keyId,
      displayAmount: `₹${amount / 100}`,
    });
  } catch (error) {
    console.error('Create Badge Order Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;

    const isValid = razorpayService.verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      await db.execute(`UPDATE payments SET status = 'failed' WHERE razorpay_order_id = ?`, [razorpay_order_id]);
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const [payments] = await db.execute(
      `SELECT * FROM payments WHERE razorpay_order_id = ? AND user_id = ?`,
      [razorpay_order_id, userId]
    );
    if (!payments.length) return res.status(404).json({ error: 'Payment not found' });

    const payment = payments[0];

    await db.execute(
      `UPDATE payments SET razorpay_payment_id = ?, razorpay_signature = ?, status = 'completed' WHERE id = ?`,
      [razorpay_payment_id, razorpay_signature, payment.id]
    );

    switch (payment.payment_type) {
      case 'subscription':   await processSubscriptionPayment(userId, payment); break;
      case 'skill_exam':     await processExamPayment(userId, payment);         break;
      case 'verified_badge': await db.execute('UPDATE users SET is_verified = TRUE WHERE id = ?', [userId]); break;
    }

    res.json({ success: true, message: 'Payment verified', paymentType: payment.payment_type });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

const processSubscriptionPayment = async (userId, payment) => {
  const startDate = new Date();
  const endDate   = new Date();
  endDate.setMonth(endDate.getMonth() + 1);

  const metadata = typeof payment.metadata === 'string' ? JSON.parse(payment.metadata) : (payment.metadata || {});

  await db.execute(
    `INSERT INTO subscriptions (user_id, plan_type, amount, status, start_date, end_date, is_first_month)
     VALUES (?, 'monthly', ?, 'active', ?, ?, ?)
     ON DUPLICATE KEY UPDATE status = 'active', start_date = ?, end_date = ?, is_first_month = FALSE`,
    [userId, payment.amount, startDate, endDate, !!metadata.isFirstMonth, startDate, endDate]
  );

  await db.execute(
    `UPDATE users SET subscription_status = 'active', subscription_end_date = ? WHERE id = ?`,
    [endDate, userId]
  );
};

const processExamPayment = async (userId, payment) => {
  const metadata = typeof payment.metadata === 'string' ? JSON.parse(payment.metadata) : (payment.metadata || {});
  await db.execute(
    `INSERT INTO exam_attempts (user_id, skill_id, payment_id) VALUES (?, ?, ?)`,
    [userId, metadata.skillId, payment.id]
  );
};

const getPaymentHistory = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit  = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const [payments] = await db.query(
      `SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      [req.user.id]
    );
    const [[total]] = await db.execute('SELECT COUNT(*) as count FROM payments WHERE user_id = ?', [req.user.id]);

    res.json({ payments, pagination: { page, limit, total: total.count, pages: Math.ceil(total.count / limit) } });
  } catch (error) {
    console.error('Get Payment History Error:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
};

const getSubscriptionStatus = async (req, res) => {
  try {
    const [subs] = await db.execute(
      `SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );

    res.json({
      status:       req.user.subscription_status,
      endDate:      req.user.subscription_end_date,
      subscription: subs[0] || null,
      prices: {
        firstMonth: config.prices.subscriptionFirstMonth / 100,
        regular:    config.prices.subscriptionRegular    / 100,
        exam:       config.prices.skillExam              / 100,
        badge:      config.prices.verifiedBadge          / 100,
      },
    });
  } catch (error) {
    console.error('Get Subscription Status Error:', error);
    res.status(500).json({ error: 'Failed to get subscription status' });
  }
};

module.exports = {
  createSubscriptionOrder, createExamOrder, createBadgeOrder,
  verifyPayment, getPaymentHistory, getSubscriptionStatus,
};