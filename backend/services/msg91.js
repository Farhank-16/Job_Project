const axios = require('axios');
const config = require('../config/config');

class MSG91Service {
  constructor() {
    this.authKey = config.msg91.authKey;
    this.senderId = config.msg91.senderId;
    this.templateId = config.msg91.templateId;
    this.baseUrl = 'https://api.msg91.com/api/v5';
  }

  /**
   * Send OTP via MSG91
   * @param {string} mobile - Mobile number (10 digits)
   * @param {string} otp - 6-digit OTP
   * @returns {Promise<boolean>}
   */
  async sendOTP(mobile, otp) {
  // Check if the environment is 'development' and log OTP to the console
  if (config.nodeEnv === 'development') {
    console.log(`📱 OTP for ${mobile}: ${otp}`);  // Directly print OTP for testing
  }

  try {
    // Format the mobile number by ensuring it starts with '91'
    const formattedMobile = mobile.startsWith('91') ? mobile : `91${mobile}`;
    
    // You can log the formatted mobile number too if needed
    console.log('Formatted Mobile:', formattedMobile);

    // Here, continue with the actual API request to MSG91 (or skip it for testing)
    const response = await axios.post(
      `${this.baseUrl}/flow/`,
      {
        template_id: this.templateId,
        short_url: '0',
        recipients: [
          {
            mobiles: formattedMobile,
            otp: otp,
          },
        ],
      },
      {
        headers: {
          'authkey': this.authKey,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('MSG91 Response:', response.data);  // You can log the full response for debugging

    // Check the response for success or failure
    if (response.data && response.data.type === 'success') {
      return true;
    } else {
      console.error('Error in sending OTP:', response.data || 'Unknown response');
      return false;
    }
  } catch (error) {
    console.error('Error in sending OTP:', error.response?.data || error.message);

    // Return true to simulate success in development mode (for debugging)
    if (config.nodeEnv === 'development') {
      console.log(`📱 OTP for ${mobile}: ${otp}`);  // Log OTP again for debugging
      return true;  // Simulate success in dev mode
    }

    // Throw error in production or non-development environments
    throw new Error('Failed to send OTP');
  }
}

  /**
   * Send transactional SMS
   * @param {string} mobile - Mobile number
   * @param {string} message - SMS content
   * @returns {Promise<boolean>}
   */
  async sendSMS(mobile, message) {
    try {
      const formattedMobile = mobile.startsWith('91') ? mobile : `91${mobile}`;
      
      const response = await axios.get(
        `${this.baseUrl}/sendhttp.php`,
        {
          params: {
            authkey: this.authKey,
            mobiles: formattedMobile,
            message: message,
            sender: this.senderId,
            route: config.msg91.route,
            country: '91',
          },
        }
      );

      return true;
    } catch (error) {
      console.error('SMS Error:', error.message);
      return false;
    }
  }
}

module.exports = new MSG91Service();