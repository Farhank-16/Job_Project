const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config/config');

class RazorpayService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }

  /**
   * Create an order for one-time payment
   * @param {number} amount - Amount in paise
   * @param {string} receipt - Unique receipt ID
   * @param {object} notes - Additional notes
   * @returns {Promise<object>}
   */
  async createOrder(amount, receipt, notes = {}) {
    try {
      const order = await this.razorpay.orders.create({
        amount: amount,
        currency: 'INR',
        receipt: receipt,
        notes: notes,
      });
      return order;
    } catch (error) {
      console.error('Razorpay Order Error:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Create a subscription
   * @param {string} planId - Razorpay plan ID
   * @param {number} totalCount - Number of billing cycles
   * @param {object} notes - Additional notes
   * @returns {Promise<object>}
   */
  async createSubscription(planId, totalCount, notes = {}) {
    try {
      const subscription = await this.razorpay.subscriptions.create({
        plan_id: planId,
        total_count: totalCount,
        notes: notes,
      });
      return subscription;
    } catch (error) {
      console.error('Razorpay Subscription Error:', error);
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Verify payment signature
   * @param {string} orderId - Razorpay order ID
   * @param {string} paymentId - Razorpay payment ID
   * @param {string} signature - Razorpay signature
   * @returns {boolean}
   */
  verifyPaymentSignature(orderId, paymentId, signature) {
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    
    return expectedSignature === signature;
  }

  /**
   * Verify subscription signature
   * @param {string} subscriptionId - Razorpay subscription ID
   * @param {string} paymentId - Razorpay payment ID
   * @param {string} signature - Razorpay signature
   * @returns {boolean}
   */
  verifySubscriptionSignature(subscriptionId, paymentId, signature) {
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${paymentId}|${subscriptionId}`)
      .digest('hex');
    
    return expectedSignature === signature;
  }

  /**
   * Fetch payment details
   * @param {string} paymentId - Razorpay payment ID
   * @returns {Promise<object>}
   */
  async fetchPayment(paymentId) {
    try {
      return await this.razorpay.payments.fetch(paymentId);
    } catch (error) {
      console.error('Fetch Payment Error:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  /**
   * Get subscription price
   * @param {boolean} isFirstMonth - Is this the first month
   * @returns {number} Amount in paise
   */
  getSubscriptionPrice(isFirstMonth) {
    return isFirstMonth ? config.prices.subscriptionFirstMonth : config.prices.subscriptionRegular;
  }
}

module.exports = new RazorpayService();