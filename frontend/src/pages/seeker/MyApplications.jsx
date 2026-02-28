import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, MapPin, ChevronRight } from 'lucide-react';
import { userService } from '../../services/userService';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';

const STATUS = {
  pending:     { bg: '#fefce8', color: '#92400e', label: 'Pending' },
  reviewed:    { bg: '#eff6ff', color: '#1d4ed8', label: 'Reviewed' },
  shortlisted: { bg: '#f0fdf4', color: '#15803d', label: 'Shortlisted' },
  rejected:    { bg: '#fff1f2', color: '#be123c', label: 'Rejected' },
  hired:       { bg: '#f0fdf4', color: '#15803d', label: '🎉 Hired' },
};

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [pagination, setPagination]     = useState({ page: 1, pages: 1 });

  useEffect(() => { loadApplications(); }, [pagination.page]);

  const loadApplications = async () => {
    try {
      const res = await userService.getAppliedJobs(pagination.page, 10);
      setApplications(prev =>
        pagination.page === 1 ? res.applications : [...prev, ...res.applications]
      );
      setPagination(res.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading && pagination.page === 1) return (
    <div className="px-4 py-4"><SkeletonList count={5} /></div>
  );

  if (!loading && applications.length === 0) return (
    <EmptyState
      icon={Briefcase}
      title="No applications yet"
      description="Start applying for jobs to see them here"
      action={() => navigate('/seeker/jobs')}
      actionLabel="Find Jobs"
    />
  );

  return (
    <div className="px-4 py-4 pb-20 space-y-3">
      <p className="text-xs text-slate-500 font-medium">{applications.length} applications</p>

      {applications.map(app => {
        const st = STATUS[app.status] || { bg: '#f1f5f9', color: '#475569', label: app.status };
        return (
          <div key={app.id}
            className="card-elevated p-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => navigate(`/seeker/jobs/${app.job_id}`)}>

            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-slate-900 text-sm truncate">{app.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{app.employer_name}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: st.bg, color: st.color }}>
                {st.label}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
              {app.job_city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />{app.job_city}
                </span>
              )}
              {app.skill_name && (
                <span className="badge badge-blue ml-auto">{app.skill_name}</span>
              )}
            </div>
          </div>
        );
      })}

      {pagination.page < pagination.pages && (
        <button
          onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
          className="w-full py-3.5 text-center text-blue-600 font-display font-semibold text-sm">
          Load More
        </button>
      )}
    </div>
  );
};

export default MyApplications;