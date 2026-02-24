import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../navigation/BottomNav';
import Header from '../navigation/Header';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      <main className="pt-14">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default MainLayout;