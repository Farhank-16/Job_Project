import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Briefcase, Award, Crown, MapPin, CheckCircle2, ArrowRight, TrendingUp } from 'lucide-react';
import useAuth from '../../context/useAuth';
import { jobService } from '../../services/jobService';
import JobCard from '../../components/cards/JobCard';
import { SkeletonList } from '../../components/ui/Skeleton';

const SeekerDashboard = () => {
  const { user, isSubscribed, isVerified, hasExamPassed } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobService.getRecommendedJobs()
      .then(({ jobs }) => setJobs(jobs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const completion = (() => {
    let s = 0;
    if (user?.name)          s += 20;
    if (user?.city)          s += 20;
    if (user?.skills?.length) s += 20;
    if (isVerified)          s += 20;
    if (hasExamPassed)       s += 20;
    return s;
  })();

  const ACTIONS = [
    { icon: Search,   bg: '#eff6ff', fg: '#2563eb', label: 'Find Jobs',        sub: 'Search nearby',     path: '/seeker/jobs' },
    { icon: Briefcase,bg: '#f0fdf4', fg: '#16a34a', label: 'My Applications',  sub: 'Track status',      path: '/seeker/applications' },
    { icon: Award,    bg: '#fffbeb', fg: '#d97706', label: 'Skill Exams',       sub: 'Get certified',     path: '/seeker/exams' },
    { icon: Crown,    bg: '#faf5ff', fg: '#7c3aed', label: 'Subscription',      sub: isSubscribed ? 'Active ✓' : 'Upgrade', path: '/seeker/subscription' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Welcome banner */}
      <div className="bg-brand px-5 pt-6 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white opacity-[0.05] -translate-y-16 translate-x-16" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Welcome back</p>
            <h2 className="font-display text-2xl font-extrabold text-white">
              {user?.name?.split(' ')[0] || 'Hello'} 👋
            </h2>
            <p className="text-blue-200 text-sm mt-1">
              {isSubscribed ? '⭐ Premium Member' : 'Free Account'}
            </p>
          </div>
          <div className="flex gap-2 mt-1">
            {isVerified   && <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div>}
            {hasExamPassed && <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><Award className="w-4 h-4 text-white" /></div>}
          </div>
        </div>

        {!isSubscribed && (
          <button onClick={() => navigate('/seeker/subscription')}
            className="mt-5 w-full py-3 bg-white rounded-xl font-display font-bold text-blue-700 text-sm flex items-center justify-between px-4">
            <span className="flex items-center gap-2"><Crown className="w-4 h-4 text-purple-500" /> Upgrade to Apply Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-6 grid grid-cols-2 gap-3 mb-5">
        {ACTIONS.map(({ icon: Icon, bg, fg, label, sub, path }) => (
          <button key={path} onClick={() => navigate(path)}
            className="card-elevated p-4 text-left active:scale-[0.97] transition-transform">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color: fg }} />
            </div>
            <p className="font-display font-bold text-slate-800 text-sm">{label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
          </button>
        ))}
      </div>

      {/* Profile completion */}
      {completion < 100 && (
        <div className="px-4 mb-5">
          <div className="card-elevated p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-display font-bold text-slate-800 text-sm">Complete Your Profile</p>
              <span className="font-display font-extrabold text-blue-600 text-sm">{completion}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
              <div className="h-2 rounded-full bg-blue-500 transition-all"
                style={{ width: `${completion}%` }} />
            </div>
            <button onClick={() => navigate('/seeker/profile')}
              className="text-xs text-blue-600 font-semibold flex items-center gap-1">
              Complete now <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Recommended jobs */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <h3 className="font-display font-bold text-slate-800 text-sm">Recommended for You</h3>
          </div>
          <button onClick={() => navigate('/seeker/jobs')}
            className="text-xs text-blue-600 font-semibold">See all</button>
        </div>

        {loading ? <SkeletonList count={3} /> : jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.slice(0, 5).map(job => <JobCard key={job.id} job={job} />)}
          </div>
        ) : (
          <div className="card-elevated p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-slate-300" />
            </div>
            <p className="font-display font-bold text-slate-700 text-sm">No jobs nearby yet</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Complete your profile for better recommendations</p>
            <button onClick={() => navigate('/seeker/jobs')}
              className="btn-secondary px-5 py-2.5 text-sm" style={{ borderRadius: '10px' }}>
              Browse All Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeekerDashboard;