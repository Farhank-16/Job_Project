import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, CreditCard, TrendingUp, UserPlus, IndianRupee, Activity } from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, bg, fg, onClick }) => (
  <div onClick={onClick}
    className={`card-elevated p-4 ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}`}>
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
        <Icon className="w-5 h-5" style={{ color: fg }} />
      </div>
      {onClick && <span className="text-slate-300">›</span>}
    </div>
    <p className="font-display text-2xl font-extrabold text-slate-900">{value}</p>
    <p className="text-xs text-slate-500 mt-0.5 font-medium">{title}</p>
  </div>
);

const AdminDashboard = () => {
  const navigate      = useNavigate();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

  return (
    <div className="px-4 py-5 space-y-5 page-enter">

      {/* Banner */}
      <div className="bg-brand rounded-2xl p-5 text-white">
        <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Overview</p>
        <h1 className="font-display text-xl font-extrabold">Admin Dashboard</h1>
        <div className="flex items-center gap-6 mt-4">
          <div>
            <p className="text-blue-200 text-xs mb-0.5">New Users (week)</p>
            <p className="font-display font-extrabold text-xl">{fmt(stats?.users?.newThisWeek)}</p>
          </div>
          <div className="w-px h-10 bg-blue-600" />
          <div>
            <p className="text-blue-200 text-xs mb-0.5">Monthly Revenue</p>
            <p className="font-display font-extrabold text-xl">₹{fmt(stats?.payments?.monthlyRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { title: 'Total Users',       value: fmt(stats?.users?.total),              icon: Users,       bg: '#eff6ff', fg: '#2563eb', onClick: () => navigate('/admin/users') },
          { title: 'Job Seekers',       value: fmt(stats?.users?.jobSeekers),          icon: UserPlus,    bg: '#f0fdf4', fg: '#16a34a' },
          { title: 'Employers',         value: fmt(stats?.users?.employers),            icon: Briefcase,   bg: '#faf5ff', fg: '#7e22ce' },
          { title: 'Subscriptions',     value: fmt(stats?.users?.activeSubscriptions),  icon: TrendingUp,  bg: '#fefce8', fg: '#ca8a04' },
          { title: 'Active Jobs',       value: fmt(stats?.jobs?.active),               icon: Activity,    bg: '#fff1f2', fg: '#e11d48', onClick: () => navigate('/admin/jobs') },
          { title: 'Total Revenue',     value: `₹${fmt(stats?.payments?.totalRevenue)}`, icon: IndianRupee, bg: '#f0fdf4', fg: '#16a34a', onClick: () => navigate('/admin/payments') },
        ].map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      {/* Quick actions */}
      <div className="card-elevated p-4">
        <h3 className="font-display font-bold text-slate-800 text-sm mb-3">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Users',     emoji: '👥', path: '/admin/users' },
            { label: 'Skills',    emoji: '🛠️', path: '/admin/skills' },
            { label: 'Questions', emoji: '📝', path: '/admin/questions' },
            { label: 'Payments',  emoji: '💳', path: '/admin/payments' },
          ].map(({ label, emoji, path }) => (
            <button key={path} onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 active:scale-95 transition-all">
              <span className="text-2xl">{emoji}</span>
              <span className="text-[10px] font-semibold text-slate-600"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* This week */}
      <div className="card-elevated p-4">
        <h3 className="font-display font-bold text-slate-800 text-sm mb-3">This Week</h3>
        {[
          { label: 'New Users',       value: fmt(stats?.users?.newThisWeek) },
          { label: 'Active Jobs',     value: fmt(stats?.jobs?.active) },
          { label: 'Monthly Revenue', value: `₹${fmt(stats?.payments?.monthlyRevenue)}` },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="font-display font-bold text-slate-900">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;