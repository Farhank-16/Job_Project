import React from 'react';
import { Outlet } from 'react-router-dom';
import Logo from '../ui/Logo';

const AuthLayout = () => (
  <div className="min-h-screen flex flex-col bg-brand">
    {/* Header */}
    <div className="flex items-center justify-center pt-10 pb-7 px-6">
      <div className="flex flex-col items-center gap-1">
        <Logo size="lg" light />
        <p className="text-blue-200 text-xs font-medium tracking-widest uppercase">Find Your Next Job</p>
      </div>
    </div>

    {/* Card */}
    <div className="flex-1 bg-white rounded-t-[2rem] shadow-2xl overflow-auto">
      <Outlet />
    </div>
  </div>
);

export default AuthLayout;