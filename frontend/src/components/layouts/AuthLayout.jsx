import React from 'react';
import { Outlet } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center pt-12 pb-8">
        <div className="flex items-center space-x-2 text-white">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <Briefcase className="w-7 h-7 text-primary-600" />
          </div>
          <span className="text-2xl font-bold">RuralJobs</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 bg-white rounded-t-3xl">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;