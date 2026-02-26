const Razorpay = require('razorpay');
const crypto   = require('crypto');
const config   = require('../config/config');

class RazorpayService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id:     config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }

  async createOrder(amount, receipt, notes = {}) {
    try {
      return await this.razorpay.orders.create({ amount, currency: 'INR', receipt, notes });
    } catch (error) {
      console.error('Razorpay Order Error:', error);
      throw new Error('Failed to create payment order');
    }
  }

  verifyPaymentSignature(orderId, paymentId, signature) {
    const expected = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    return expected === signature;
  }

  async fetchPayment(paymentId) {
    try {
      return await this.razorpay.payments.fetch(paymentId);
    } catch (error) {
      console.error('Fetch Payment Error:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  getSubscriptionPrice(isFirstMonth) {
    return isFirstMonth
      ? config.prices.subscriptionFirstMonth
      : config.prices.subscriptionRegular;
  }
}

module.exports = new RazorpayService();