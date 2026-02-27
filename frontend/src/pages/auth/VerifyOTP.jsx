import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../context/useAuth';
import OTPInput from '../../components/forms/OTPInput';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const { verifyOTP, requestOTP } = useAuth();
  const navigate = useNavigate();

  const mobile = sessionStorage.getItem('pendingMobile');
  const isNewUser = sessionStorage.getItem('isNewUser') === 'true';

  useEffect(() => {
    if (!mobile) {
      navigate('/login');
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [mobile, navigate]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      if (isNewUser) {
        sessionStorage.setItem('pendingOTP', otp);
        navigate('/select-role');
      } else {
        const result = await verifyOTP(mobile, otp);
        sessionStorage.removeItem('pendingMobile');
        sessionStorage.removeItem('isNewUser');
        
        if (!result.user.profileCompleted) {
          navigate('/complete-profile');
        } else {
          navigate(result.user.role === 'employer' ? '/employer' : '/seeker');
        }
      }
    } catch (error) {
      toast.error(error.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await requestOTP(mobile);
      setResendTimer(30);
      toast.success('OTP resent successfully');
    } catch (error) {
      toast.error(error.error || 'Failed to resend OTP');
    }
  };

  return (
    <div className="px-6 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Verify OTP</h2>
        <p className="text-gray-600 mt-2">
          Enter the 6-digit code sent to
          <br />
          <span className="font-medium text-gray-900">+91 {mobile}</span>
        </p>
      </div>

      <div className="mb-8">
        <OTPInput
          length={6}
          value={otp}
          onChange={setOtp}
          disabled={loading}
        />
      </div>

      <Button
        onClick={handleVerify}
        fullWidth
        size="lg"
        loading={loading}
        disabled={otp.length !== 6}
      >
        Verify & Continue
      </Button>

      <div className="text-center mt-6">
        {resendTimer > 0 ? (
          <p className="text-gray-500">
            Resend OTP in <span className="font-medium">{resendTimer}s</span>
          </p>
        ) : (
          <button
            onClick={handleResend}
            className="text-primary-600 font-medium hover:underline"
          >
            Resend OTP
          </button>
        )}
      </div>

      <button
        onClick={() => navigate('/login')}
        className="block w-full text-center mt-4 text-gray-500 hover:text-gray-700"
      >
        Change Mobile Number
      </button>
    </div>
  );
};

export default VerifyOTP;