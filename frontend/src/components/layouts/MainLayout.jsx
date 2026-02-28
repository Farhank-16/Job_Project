import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../navigation/BottomNav';
import Header from '../navigation/Header';

const MainLayout = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <main className="pt-14 pb-20 min-h-screen">
      <Outlet />
    </main>
    <BottomNav />
  </div>
);

export default MainLayout;