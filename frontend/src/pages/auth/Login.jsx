import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';
import useAuth from '../../context/useAuth';
import toast from 'react-hot-toast';

const Login = () => {
  const [mobile, setMobile]   = useState('');
  const [loading, setLoading] = useState(false);
  const { requestOTP }        = useAuth();
  const navigate              = useNavigate();

  const isValid = /^[6-9]\d{9}$/.test(mobile);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) { toast.error('Please enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      const result = await requestOTP(mobile);
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
    <div className="px-6 py-8 page-enter">
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold text-slate-900">Welcome back </h2>
        <p className="text-slate-500 text-sm mt-1">Sign in or create your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number</label>
          <div className="flex rounded-xl overflow-hidden transition-all"
            style={{
              border: `2px solid ${mobile.length > 0 ? '#2563eb' : '#e2e8f0'}`,
              boxShadow: mobile.length > 0 ? '0 0 0 3px rgba(37,99,235,0.10)' : 'none',
            }}>
            <div className="flex items-center px-4 bg-slate-50 border-r border-slate-200 gap-1.5">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600 font-semibold text-sm">+91</span>
            </div>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10-digit number"
              className="flex-1 px-4 py-3.5 text-base font-semibold bg-white outline-none text-slate-900"
              inputMode="numeric"
              autoFocus
            />
            {isValid && <div className="flex items-center pr-4 text-blue-600 font-bold">✓</div>}
          </div>
          <p className="text-xs text-slate-400 mt-1.5 ml-1">We'll send an OTP — no password needed</p>
        </div>

        <button type="submit" disabled={!isValid || loading}
          className="btn-primary w-full py-4 text-base justify-between"
          style={{ borderRadius: '12px' }}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending OTP...
            </span>
          ) : (
            <><span>Send OTP</span><ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400 mt-8 leading-relaxed">
        By continuing, you agree to our{' '}
        <a href="#" className="text-blue-600 font-medium">Terms</a> &{' '}
        <a href="#" className="text-blue-600 font-medium">Privacy Policy</a>
      </p>
    </div>
  );
};

export default Login;