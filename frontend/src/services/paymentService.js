import api from "./api";

export const paymentService = {
  createSubscriptionOrder: () =>
    api.post("/payments/subscription/create").then((r) => r.data),

  createExamOrder: (skillId) =>
    api.post("/payments/exam/create", { skillId }).then((r) => r.data),

  createBadgeOrder: () =>
    api.post("/payments/badge/create").then((r) => r.data),

  verifyPayment: (data) =>
    api.post("/payments/verify", data).then((r) => r.data),
  
  getPaymentHistory: (page = 1, limit = 10) =>
    api
      .get(`/payments/history?page=${page}&limit=${limit}`)
      .then((r) => r.data),
      
  getSubscriptionStatus: () =>
    api.get("/payments/subscription/status").then((r) => r.data),

  openRazorpay: (options) =>
    new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        ...options,
        handler: (response) => resolve(response),
        modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
      });
      rzp.open();
    }),
};
