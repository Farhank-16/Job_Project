import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Briefcase, Users, Eye, 
  Crown, TrendingUp, MapPin 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { jobService } from '../../services/jobService';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';

const EmployerDashboard = () => {
  const { user, isSubscribed } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalViews: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { jobs } = await jobService.getMyJobs(1, 5);
      setRecentJobs(jobs);
      
      // Calculate stats
      const activeJobs = jobs.filter(j => j.is_active).length;
      const totalApplications = jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0);
      const totalViews = jobs.reduce((sum, j) => sum + (j.views_count || 0), 0);
      
      setStats({
        totalJobs: jobs.length,
        activeJobs,
        totalApplications,
        totalViews,
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Welcome Card */}
      <div className="card p-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <h2 className="text-xl font-bold">Welcome, {user?.name || 'Employer'}!</h2>
        <p className="text-primary-100 mt-1">
          {isSubscribed ? 'Premium Account' : 'Free Account'}
        </p>

        {!isSubscribed && (
          <button
            onClick={() => navigate('/employer/subscription')}
            className="mt-4 w-full py-2.5 bg-white text-primary-600 rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            <Crown className="w-5 h-5" />
            <span>Upgrade to Contact Candidates</span>
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
              <p className="text-sm text-gray-500">Active Jobs</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalApplications}</p>
              <p className="text-sm text-gray-500">Applications</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              <p className="text-sm text-gray-500">Total Views</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalJobs}</p>
              <p className="text-sm text-gray-500">Total Jobs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          fullWidth
          onClick={() => navigate('/employer/post-job')}
          icon={Plus}
        >
          Post New Job
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => navigate('/employer/candidates')}
          icon={Users}
        >
          Find Candidates
        </Button>
      </div>

      {/* Recent Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recent Jobs</h3>
          <button 
            onClick={() => navigate('/employer/jobs')}
            className="text-sm text-primary-600 font-medium"
          >
            View all
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : recentJobs.length > 0 ? (
          <div className="space-y-3">
            {recentJobs.map(job => (
              <div 
                key={job.id}
                className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/employer/jobs/${job.id}/applications`)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.city}
                    </p>
                  </div>
                  <Badge variant={job.is_active ? 'success' : 'default'}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <span>{job.applications_count || 0} applications</span>
                  <span>{job.views_count || 0} views</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">No jobs posted yet</h4>
            <p className="text-sm text-gray-500 mb-4">
              Post your first job to start hiring
            </p>
            <Button onClick={() => navigate('/employer/post-job')} size="sm">
              Post Job
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;