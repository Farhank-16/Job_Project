import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import useAuth from '../../context/useAuth';
import OTPInput from '../../components/forms/OTPInput';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp]               = useState('');
  const [loading, setLoading]       = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const { verifyOTP, requestOTP }   = useAuth();
  const navigate                    = useNavigate();

  const mobile    = sessionStorage.getItem('pendingMobile');
  const isNewUser = sessionStorage.getItem('isNewUser') === 'true';

  useEffect(() => {
    if (!mobile) { navigate('/login'); return; }
    const t = setInterval(() => setResendTimer(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [mobile, navigate]);

  const handleVerify = async () => {
    if (otp.length !== 6) { toast.error('6-digit OTP daalo'); return; }
    setLoading(true);
    try {
      if (isNewUser) {
        sessionStorage.setItem('pendingOTP', otp);
        navigate('/select-role');
      } else {
        const result = await verifyOTP(mobile, otp);
        sessionStorage.removeItem('pendingMobile');
        sessionStorage.removeItem('isNewUser');
        if (!result.user.profileCompleted) navigate('/complete-profile');
        else navigate(result.user.role === 'employer' ? '/employer' : '/seeker');
      }
    } catch (error) {
      toast.error(error.error || 'OTP galat hai');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await requestOTP(mobile);
      setResendTimer(30);
      toast.success('OTP dobara bheja!');
    } catch (error) {
      toast.error(error.error || 'Dobara bhejne mein problem');
    }
  };

  return (
    <div className="px-6 py-8 page-enter">
      <button onClick={() => navigate('/login')} className="flex items-center gap-1.5 text-gray-500 text-sm mb-6 -ml-1">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-8">
        <h2 className="font-display text-2xl font-black text-gray-900">Verify OTP</h2>
        <p className="text-gray-500 mt-1 text-sm">
          6-digit code is sent to {' '}
          <span className="font-bold text-gray-800">+91 {mobile}</span> 
        </p>
      </div>

      <div className="mb-8">
        <OTPInput length={6} value={otp} onChange={setOtp} disabled={loading} />
      </div>

      <button
        onClick={handleVerify}
        disabled={otp.length !== 6 || loading}
        className="btn-primary w-full py-4 text-base mb-6"
        style={{ borderRadius: '12px' }}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Verifying...
          </span>
        ) : 'Verify '}
      </button>

      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-gray-400 text-sm">
            Resend Again: <span className="font-bold text-gray-600">{resendTimer}s</span>
          </p>
        ) : (
          <button onClick={handleResend}
            className="flex items-center gap-1.5 text-green-600 font-semibold text-sm mx-auto">
            <RefreshCw className="w-4 h-4" /> Resend OTP
          </button>
        )}
      </div>
    </div>
  );
};

export default VerifyOTP;