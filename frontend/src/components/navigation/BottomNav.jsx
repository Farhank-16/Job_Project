import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Briefcase, User, Users, FileText, Settings, CreditCard } from 'lucide-react';
import useAuth from '../../context/useAuth';

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    if (user?.role === 'job_seeker') {
      return [
        { path: '/seeker', icon: Home, label: 'Home' },
        { path: '/seeker/jobs', icon: Search, label: 'Jobs' },
        { path: '/seeker/applications', icon: Briefcase, label: 'Applied' },
        { path: '/seeker/profile', icon: User, label: 'Profile' },
      ];
    }

    if (user?.role === 'employer') {
      return [
        { path: '/employer', icon: Home, label: 'Home' },
        { path: '/employer/jobs', icon: Briefcase, label: 'My Jobs' },
        { path: '/employer/candidates', icon: Users, label: 'Candidates' },
        { path: '/employer/profile', icon: User, label: 'Profile' },
      ];
    }

    if (user?.role === 'admin') {
      return [
        { path: '/admin', icon: Home, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
        { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-40">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-2' : ''}`} />
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;