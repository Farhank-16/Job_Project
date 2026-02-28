import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Users, Eye, Crown, TrendingUp, MapPin, ArrowRight, ChevronRight, CheckCircle2, BadgeCheck } from 'lucide-react';
import useAuth from '../../context/useAuth';
import { jobService } from '../../services/jobService';
import { SkeletonCard } from '../../components/ui/Skeleton';

const EmployerDashboard = () => {
  const { user, isSubscribed, isVerified } = useAuth();
  const navigate = useNavigate();
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [stats, setStats]           = useState({ activeJobs: 0, totalApplications: 0, totalViews: 0, totalJobs: 0 });

  useEffect(() => {
    jobService.getMyJobs(1, 5)
      .then(({ jobs }) => {
        setRecentJobs(jobs);
        setStats({
          activeJobs:        jobs.filter(j => j.is_active).length,
          totalJobs:         jobs.length,
          totalApplications: jobs.reduce((s, j) => s + (j.applications_count || 0), 0),
          totalViews:        jobs.reduce((s, j) => s + (j.views_count || 0), 0),
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const STATS = [
    { icon: Briefcase,  bg: '#eff6ff', fg: '#2563eb', val: stats.activeJobs,        label: 'Active Jobs' },
    { icon: Users,      bg: '#f0fdf4', fg: '#16a34a', val: stats.totalApplications, label: 'Applications' },
    { icon: Eye,        bg: '#faf5ff', fg: '#7c3aed', val: stats.totalViews,        label: 'Total Views' },
    { icon: TrendingUp, bg: '#fffbeb', fg: '#d97706', val: stats.totalJobs,         label: 'Total Jobs' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Banner */}
      <div className="bg-brand px-5 pt-6 pb-14 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white opacity-[0.05] -translate-y-16 translate-x-16" />
        <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Employer Dashboard</p>
        <div className="flex items-center gap-2 ">
          <h2 className="font-display text-2xl font-extrabold text-white">
            {user?.name?.split(' ')[0] || 'Welcome'} 👋
          </h2>
          {isVerified && (
            <div className="w-7 h-7  bg-white/20 rounded-full flex items-center justify-center"
              title="Verified Employer">
              <BadgeCheck className="w-4  h-4 text-white" />
            </div>
          )}
        </div>
        <p className="text-blue-200 text-sm mt-1">{isSubscribed ? '⭐ Premium Account' : 'Free Account'}</p>
        {!isSubscribed && (
          <button onClick={() => navigate('/employer/subscription')}
            className="mt-5 w-full py-3 bg-white rounded-xl font-display font-bold text-blue-700 text-sm flex items-center justify-between px-4">
            <span className="flex items-center gap-2"><Crown className="w-4 h-4 text-purple-500" /> Upgrade to Contact Candidates</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Stats grid */}
      <div className="px-4 mt-6 grid grid-cols-2 gap-3 mb-5">
        {STATS.map(({ icon: Icon, bg, fg, val, label }) => (
          <div key={label} className="card-elevated p-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
              style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color: fg }} />
            </div>
            <p className="font-display text-2xl font-extrabold text-slate-900">{val}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="px-4 mb-5 flex gap-3">
        <button onClick={() => navigate('/employer/post-job')}
          className="btn-primary flex-1 py-3 text-sm gap-2" style={{ borderRadius: '10px' }}>
          <Plus className="w-4 h-4" /> Post Job
        </button>
        <button onClick={() => navigate('/employer/candidates')}
          className="btn-secondary flex-1 py-3 text-sm gap-2" style={{ borderRadius: '10px' }}>
          <Users className="w-4 h-4" /> Candidates
        </button>
      </div>

      {/* Recent jobs */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-slate-800 text-sm">Recent Jobs</h3>
          <button onClick={() => navigate('/employer/jobs')}
            className="text-xs text-blue-600 font-semibold">View all</button>
        </div>

        {loading ? (
          <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
        ) : recentJobs.length > 0 ? (
          <div className="space-y-3">
            {recentJobs.map(job => (
              <div key={job.id}
                className="card-elevated p-4 cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => navigate(`/employer/jobs/${job.id}/applications`)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-bold text-slate-900 text-sm truncate">{job.title}</h4>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3" />{job.area && `${job.area}, `}{job.city}
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                    style={{ background: job.is_active ? '#f0fdf4' : '#f1f5f9', color: job.is_active ? '#15803d' : '#64748b' }}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-slate-50">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5" />{job.applications_count || 0} applied
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Eye className="w-3.5 h-3.5" />{job.views_count || 0} views
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-elevated p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6 text-slate-300" />
            </div>
            <p className="font-display font-bold text-slate-700 text-sm">No jobs posted yet</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Post your first job to start hiring</p>
            <button onClick={() => navigate('/employer/post-job')}
              className="btn-primary px-6 py-2.5 text-sm" style={{ borderRadius: '10px' }}>
              Post Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;