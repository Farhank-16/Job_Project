import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Bell } from 'lucide-react';
import useAuth from '../../context/useAuth';
import Logo from '../ui/Logo';

const TITLES = {
  '/seeker':                  null,
  '/seeker/jobs':             'Find Jobs',
  '/seeker/applications':     'My Applications',
  '/seeker/profile':          'Profile',
  '/seeker/exams':            'Skill Exams',
  '/seeker/subscription':     'Subscription',
  '/employer':                null,
  '/employer/post-job':       'Post a Job',
  '/employer/jobs':           'My Jobs',
  '/employer/candidates':     'Find Candidates',
  '/employer/profile':        'Profile',
  '/employer/subscription':   'Subscription',
  '/admin':                   null,
  '/admin/users':             'Manage Users',
  '/admin/jobs':              'Manage Jobs',
  '/admin/skills':            'Manage Skills',
  '/admin/questions':         'Exam Questions',
  '/admin/payments':          'Payments',
};

const getTitle = (pathname) => {
  if (TITLES[pathname] !== undefined) return TITLES[pathname]; // null = show logo
  for (const [key, val] of Object.entries(TITLES)) {
    if (key !== '/' && pathname.startsWith(key + '/')) return val || 'JobNest';
  }
  return 'JobNest';
};

const BASE_PATHS = ['/seeker', '/employer', '/admin'];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isBase  = BASE_PATHS.includes(location.pathname);
  const title   = getTitle(location.pathname);
  const showLogo = title === null; // null means home screen → show logo

  return (
    <header className="fixed top-0 left-0 right-0 bg-white z-40"
      style={{ borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 0 #f1f5f9, 0 2px 8px rgba(0,0,0,0.04)' }}>
      <div className="flex items-center justify-between h-14 px-4">

        {/* Left */}
        <div className="w-10">
          {!isBase && (
            <button onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors -ml-1">
              <ChevronLeft className="w-5 h-5 text-slate-700" />
            </button>
          )}
        </div>

        {/* Center */}
        {showLogo
          ? <Logo size="md" />
          : <h1 className="font-display text-base font-bold text-slate-900">{title}</h1>
        }

        {/* Right */}
        <div className="flex items-center gap-1">
          <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 relative">
            <Bell className="w-5 h-5 text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>
          {user && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-display font-bold ml-1"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
              {user.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;