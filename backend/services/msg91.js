const axios  = require('axios');
const config = require('../config/config');

class MSG91Service {
  constructor() {
    this.authKey    = config.msg91.authKey;
    this.senderId   = config.msg91.senderId;
    this.templateId = config.msg91.templateId;
    this.baseUrl    = 'https://api.msg91.com/api/v5';
  }

  async sendOTP(mobile, otp) {
    // Dev mode — log OTP, skip API call
    if (config.nodeEnv === 'development') {
      console.log(`📱 DEV OTP for ${mobile}: ${otp}`);
      return true;
    }

    const formattedMobile = mobile.startsWith('91') ? mobile : `91${mobile}`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/flow/`,
        {
          template_id: this.templateId,
          short_url:   '0',
          recipients:  [{ mobiles: formattedMobile, otp }],
        },
        { headers: { authkey: this.authKey, 'Content-Type': 'application/json' } }
      );

      return response.data?.type === 'success';
    } catch (error) {
      console.error('MSG91 OTP Error:', error.response?.data || error.message);
      throw new Error('Failed to send OTP');
    }
  }

  async sendSMS(mobile, message) {
    try {
      const formattedMobile = mobile.startsWith('91') ? mobile : `91${mobile}`;
      await axios.get(`${this.baseUrl}/sendhttp.php`, {
        params: {
          authkey: this.authKey,
          mobiles: formattedMobile,
          message,
          sender:  this.senderId,
          route:   config.msg91.route,
          country: '91',
        },
      });
      return true;
    } catch (error) {
      console.error('SMS Error:', error.message);
      return false;
    }
  }
}

module.exports = new MSG91Service();