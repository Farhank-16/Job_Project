import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Briefcase, User, Users, CreditCard } from 'lucide-react';
import useAuth from '../../context/useAuth';

const NAV = {
  job_seeker: [
    { path: '/seeker',              icon: Home,      label: 'Home' },
    { path: '/seeker/jobs',         icon: Search,    label: 'Jobs' },
    { path: '/seeker/applications', icon: Briefcase, label: 'Applied' },
    { path: '/seeker/profile',      icon: User,      label: 'Profile' },
  ],
  employer: [
    { path: '/employer',            icon: Home,      label: 'Home' },
    { path: '/employer/jobs',       icon: Briefcase, label: 'My Jobs' },
    { path: '/employer/candidates', icon: Users,     label: 'Candidates' },
    { path: '/employer/profile',    icon: User,      label: 'Profile' },
  ],
  admin: [
    { path: '/admin',               icon: Home,      label: 'Dashboard' },
    { path: '/admin/users',         icon: Users,     label: 'Users' },
    { path: '/admin/jobs',          icon: Briefcase, label: 'Jobs' },
    { path: '/admin/payments',      icon: CreditCard,label: 'Payments' },
  ],
};

const BASE = { job_seeker: '/seeker', employer: '/employer', admin: '/admin' };

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();
  const items    = NAV[user?.role] || [];
  const base     = BASE[user?.role] || '';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white safe-bottom z-40"
      style={{ boxShadow: '0 -1px 0 #e2e8f0, 0 -4px 16px rgba(0,0,0,0.05)' }}>
      <div className="flex items-stretch h-16">
        {items.map((item) => {
          const isActive = item.path === base
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 gap-0.5 relative"
              style={{ color: isActive ? '#2563eb' : '#94a3b8' }}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                  style={{ background: '#2563eb' }} />
              )}
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50' : ''}`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.75} />
              </div>
              <span className="text-[10px] font-semibold"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;