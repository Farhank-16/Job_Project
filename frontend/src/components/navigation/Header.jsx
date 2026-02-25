import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getTitle = () => {
    const path = location.pathname;
    
    if (path.includes('/seeker')) {
      if (path === '/seeker') return ' Dashboard';
      if (path.includes('/jobs')) return 'Find Jobs';
      if (path.includes('/applications')) return 'My Applications';
      if (path.includes('/profile')) return 'Profile';
      if (path.includes('/exams')) return 'Skill Exams';
      if (path.includes('/subscription')) return 'Subscription';
    }
    
    if (path.includes('/employer')) {
      if (path === '/employer') return 'Employer Dashboard';
      if (path.includes('/post-job')) return 'Post Job';
      if (path.includes('/jobs')) return 'My Jobs';
      if (path.includes('/candidates')) return 'Find Candidates';
      if (path.includes('/profile')) return 'Employer Profile';
      if (path.includes('/subscription')) return 'Subscription';
    }

    if (path.includes('/admin')) {
      if (path === '/admin') return 'Admin Dashboard';
      if (path.includes('/users')) return 'Manage Users';
      if (path.includes('/jobs')) return 'Manage Jobs';
      if (path.includes('/skills')) return 'Manage Skills';
      if (path.includes('/questions')) return 'Exam Questions';
      if (path.includes('/payments')) return 'Payments';
    }

    return 'RuralJobs';
  };

  const showBackButton = () => {
    const basePaths = ['/seeker', '/employer', '/admin'];
    return !basePaths.includes(location.pathname);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left */}
        <div className="flex items-center">
          {showBackButton() ? (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-lg font-semibold text-gray-900">
          {getTitle()}
        </h1>

        {/* Right */}
        <div className="flex items-center">
          <button className="p-2 hover:bg-gray-100 rounded-full relative">
            <Bell className="w-6 h-6 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;