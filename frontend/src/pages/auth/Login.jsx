import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import useAuth from '../../context/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestOTP } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const result = await requestOTP(mobile);
      
      // Store mobile for OTP verification
      sessionStorage.setItem('pendingMobile', mobile);
      sessionStorage.setItem('isNewUser', result.isNewUser);
      
      toast.success('OTP sent successfully!');
      navigate('/verify-otp');
    } catch (error) {
      toast.error(error.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome!</h2>
        <p className="text-gray-600 mt-2">Enter your mobile number to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number
          </label>
          <div className="flex">
            <div className="flex items-center px-4 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
              <span className="text-gray-600">+91</span>
            </div>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10-digit number"
              className="flex-1 input rounded-l-none"
              inputMode="numeric"
              autoFocus
            />
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={loading}
          disabled={mobile.length !== 10}
        >
          Get OTP
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-8">
        By continuing, you agree to our{' '}
        <a href="#" className="text-primary-600 hover:underline">Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
      </p>
    </div>
  );
};

export default Login;