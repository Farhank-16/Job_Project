import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import Logo from '../components/ui/Logo';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 page-enter">
      {/* Logo */}
      <div className="mb-10">
        <Logo size="md" />
      </div>

      {/* Illustration */}
      <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center mb-6"
        style={{ boxShadow: '0 0 0 8px #eff6ff' }}>
        <span className="text-5xl select-none">404</span>
      </div>

      <h1 className="font-display text-2xl font-extrabold text-slate-900 mb-2 text-center">
        Page Not Found
      </h1>
      <p className="text-slate-500 text-sm text-center max-w-xs mb-8 leading-relaxed">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={() => navigate(-1)}
          className="btn-secondary w-full py-3" style={{ borderRadius: '12px' }}>
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
        <button onClick={() => navigate('/')}
          className="btn-primary w-full py-3" style={{ borderRadius: '12px' }}>
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;