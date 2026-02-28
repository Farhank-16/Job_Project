import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import useAuth from '../context/useAuth';

const MESSAGES = {
  subscription: {
    emoji: '👑',
    title: 'Subscription Activated!',
    desc:  'You now have full access to all premium features.',
    color: '#7c3aed',
    bg:    '#faf5ff',
  },
  exam: {
    emoji: '🏆',
    title: 'Payment Successful!',
    desc:  'Your exam is ready. Good luck!',
    color: '#d97706',
    bg:    '#fffbeb',
  },
  badge: {
    emoji: '✅',
    title: 'Verified Badge Active!',
    desc:  'Your profile now shows the verified badge.',
    color: '#2563eb',
    bg:    '#eff6ff',
  },
  default: {
    emoji: '🎉',
    title: 'Payment Successful!',
    desc:  'Your payment has been processed successfully.',
    color: '#16a34a',
    bg:    '#f0fdf4',
  },
};

const PaymentSuccess = () => {
  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();
  const { user, refreshUser } = useAuth();
  const type              = searchParams.get('type') || 'default';
  const msg               = MESSAGES[type] || MESSAGES.default;

  useEffect(() => { refreshUser(); }, []);

  const home = user?.role === 'employer' ? '/employer' : '/seeker';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 page-enter">

      {/* Icon */}
      <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 text-5xl"
        style={{ background: msg.bg, boxShadow: `0 0 0 8px ${msg.bg}` }}>
        {msg.emoji}
      </div>

      {/* Check badge */}
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-5 h-5" style={{ color: msg.color }} />
        <span className="text-sm font-semibold" style={{ color: msg.color }}>
          Payment Confirmed
        </span>
      </div>

      <h1 className="font-display text-2xl font-extrabold text-slate-900 text-center mb-2">
        {msg.title}
      </h1>
      <p className="text-slate-500 text-sm text-center max-w-xs leading-relaxed mb-10">
        {msg.desc}
      </p>

      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={() => navigate(home)}
          className="btn-primary w-full py-4 text-base justify-between"
          style={{ borderRadius: '12px' }}
        >
          <span>Go to Dashboard</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        {type === 'exam' && (
          <button
            onClick={() => navigate('/seeker/exams')}
            className="btn-secondary w-full py-3 text-sm"
            style={{ borderRadius: '12px' }}
          >
            Start Exam Now
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;