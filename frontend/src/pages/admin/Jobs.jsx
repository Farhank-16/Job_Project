import React, { useState, useEffect } from 'react';
import { Search, MapPin, Eye, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { SkeletonList } from '../../components/ui/Skeleton';

const STATUS_BADGE = {
  true:  { bg: '#f0fdf4', color: '#15803d', label: 'Active' },
  false: { bg: '#f1f5f9', color: '#64748b', label: 'Inactive' },
};

const AdminJobs = () => {
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    setPagination(p => ({ ...p, page: 1 }));
  }, [search, status]);

  useEffect(() => { loadJobs(); }, [search, status, pagination.page]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllJobs({ search, status, page: pagination.page, limit: 10 });
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Sticky filters */}
      <div className="sticky top-14 bg-white border-b border-slate-100 z-30 px-4 py-3 space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search jobs..."
            className="input pl-9 py-2.5 text-sm"
            style={{ borderRadius: '10px' }}
          />
        </div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="input py-2.5 text-sm"
          style={{ borderRadius: '10px' }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="px-4 py-4">
        {!loading && (
          <p className="text-xs text-slate-500 mb-3 font-medium">{pagination.total} jobs found</p>
        )}

        {loading ? <SkeletonList count={5} /> : (
          <div className="space-y-3">
            {jobs.map(job => {
              const badge = STATUS_BADGE[job.is_active] || STATUS_BADGE[false];
              return (
                <div key={job.id} className="card-elevated p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-slate-900 text-sm truncate">{job.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{job.employer_name}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                        <MapPin className="w-3 h-3" />{job.city}
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Users className="w-3.5 h-3.5" />{job.applications_count || 0} applied
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Eye className="w-3.5 h-3.5" />{job.views_count || 0} views
                    </span>
                    <span className="text-xs text-slate-400 ml-auto">
                      {new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {job.skill_name && (
                    <span className="badge badge-blue mt-2">{job.skill_name}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-5">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
              style={{ borderRadius: '10px' }}
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm text-slate-500 font-medium">
              {pagination.page} / {pagination.pages}
            </span>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              className="btn-secondary px-4 py-2 text-sm disabled:opacity-40"
              style={{ borderRadius: '10px' }}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJobs;