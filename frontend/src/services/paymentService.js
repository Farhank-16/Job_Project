import api from './api';

export const paymentService = {
  // Create subscription order
  createSubscriptionOrder: async () => {
    const response = await api.post('/payments/subscription/create');
    return response.data;
  },

  // Create exam order
  createExamOrder: async (skillId) => {
    const response = await api.post('/payments/exam/create', { skillId });
    return response.data;
  },

  // Create badge order
  createBadgeOrder: async () => {
    const response = await api.post('/payments/badge/create');
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    const response = await api.post('/payments/verify', paymentData);
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async (page = 1, limit = 10) => {
    const response = await api.get(`/payments/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get subscription status
  getSubscriptionStatus: async () => {
    const response = await api.get('/payments/subscription/status');
    return response.data;
  },

  // Open Razorpay checkout
  openRazorpay: (options) => {
    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        ...options,
        handler: (response) => resolve(response),
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      });
      rzp.open();
    });
  },
};