import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, CreditCard, TrendingUp, UserPlus, DollarSign } from 'lucide-react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      icon: Users,
      color: 'blue',
      onClick: () => navigate('/admin/users'),
    },
    {
      title: 'Job Seekers',
      value: stats?.users?.jobSeekers || 0,
      icon: UserPlus,
      color: 'green',
    },
    {
      title: 'Employers',
      value: stats?.users?.employers || 0,
      icon: Briefcase,
      color: 'purple',
    },
    {
      title: 'Active Subscriptions',
      value: stats?.users?.activeSubscriptions || 0,
      icon: TrendingUp,
      color: 'yellow',
    },
    {
      title: 'Total Jobs',
      value: stats?.jobs?.total || 0,
      icon: Briefcase,
      color: 'indigo',
      onClick: () => navigate('/admin/jobs'),
    },
    {
      title: 'Total Revenue',
      value: `₹${(stats?.payments?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'green',
      onClick: () => navigate('/admin/payments'),
    },
  ];

  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`card p-4 ${stat.onClick ? 'cursor-pointer hover:shadow-md' : ''}`}
            onClick={stat.onClick}
          >
            <div className={`w-10 h-10 rounded-lg ${colors[stat.color]} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100"
          >
            <Users className="w-5 h-5 text-gray-600 mb-1" />
            <span className="text-sm font-medium">Manage Users</span>
          </button>
          <button
            onClick={() => navigate('/admin/skills')}
            className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100"
          >
            <Briefcase className="w-5 h-5 text-gray-600 mb-1" />
            <span className="text-sm font-medium">Manage Skills</span>
          </button>
          <button
            onClick={() => navigate('/admin/questions')}
            className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100"
          >
            <TrendingUp className="w-5 h-5 text-gray-600 mb-1" />
            <span className="text-sm font-medium">Exam Questions</span>
          </button>
          <button
            onClick={() => navigate('/admin/payments')}
            className="p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100"
          >
            <CreditCard className="w-5 h-5 text-gray-600 mb-1" />
            <span className="text-sm font-medium">Payments</span>
          </button>
        </div>
      </div>

      {/* Recent Stats */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 mb-4">This Week</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">New Users</span>
            <span className="font-semibold">{stats?.users?.newThisWeek || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Active Jobs</span>
            <span className="font-semibold">{stats?.jobs?.active || 0}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Monthly Revenue</span>
            <span className="font-semibold">₹{(stats?.payments?.monthlyRevenue || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;