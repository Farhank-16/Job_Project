import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Users, Eye, Edit2, Trash2, MoreVertical, ChevronRight } from 'lucide-react';
import { jobService } from '../../services/jobService';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const MyJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [openMenu, setOpenMenu]     = useState(null);
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => {
    jobService.getMyJobs(1, 50)
      .then(({ jobs }) => setJobs(jobs))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (job) => {
    try {
      await jobService.updateJob(job.id, { isActive: !job.is_active });
      setJobs(p => p.map(j => j.id === job.id ? { ...j, is_active: !j.is_active } : j));
      toast.success(`Job ${job.is_active ? 'deactivated' : 'activated'}`);
    } catch { toast.error('Failed to update'); }
    setOpenMenu(null);
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    setDeleting(true);
    try {
      await jobService.deleteJob(selectedJob.id);
      setJobs(p => p.filter(j => j.id !== selectedJob.id));
      toast.success('Job deleted');
      setSelectedJob(null);
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  if (loading) return <div className="px-4 py-4"><SkeletonList count={5} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Header */}
      <div className="sticky top-14 bg-white border-b border-slate-100 z-30 px-4 py-3 flex justify-between items-center">
        <p className="font-display font-bold text-slate-800 text-sm">{jobs.length} Jobs</p>
        <button onClick={() => navigate('/employer/post-job')}
          className="btn-primary px-4 py-2 text-sm gap-1.5" style={{ borderRadius: '10px' }}>
          <Plus className="w-4 h-4" /> Post Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <EmptyState title="No jobs posted" description="Post your first job to start hiring"
          action={() => navigate('/employer/post-job')} actionLabel="Post Job" />
      ) : (
        <div className="px-4 py-4 space-y-3">
          {jobs.map(job => (
            <div key={job.id} className="card-elevated p-4" onClick={() => openMenu && setOpenMenu(null)}>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => navigate(`/employer/jobs/${job.id}/applications`)}>
                  <h3 className="font-display font-bold text-slate-900 text-sm truncate">{job.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                    <MapPin className="w-3 h-3" />{job.area && `${job.area}, `}{job.city}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: job.is_active ? '#f0fdf4' : '#f1f5f9', color: job.is_active ? '#15803d' : '#64748b' }}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </span>

                  <div className="relative">
                    <button onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === job.id ? null : job.id); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                    {openMenu === job.id && (
                      <div className="absolute right-0 top-9 bg-white rounded-xl shadow-lg border border-slate-100 py-1 min-w-[140px] z-20">
                        <button onClick={() => { navigate(`/employer/jobs/${job.id}/edit`); setOpenMenu(null); }}
                          className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-slate-50">
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit
                        </button>
                        <button onClick={() => toggleStatus(job)}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50">
                          {job.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => { setSelectedJob(job); setOpenMenu(null); }}
                          className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-red-50 text-red-500">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-slate-50">
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Users className="w-3.5 h-3.5" />{job.applications_count || 0} applications
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Eye className="w-3.5 h-3.5" />{job.views_count || 0} views
                </span>
                {job.skill_name && <span className="badge badge-blue ml-auto">{job.skill_name}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <Modal isOpen={!!selectedJob} onClose={() => setSelectedJob(null)} title="Delete Job">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm">
            Are you sure you want to delete <strong className="text-slate-900">{selectedJob?.title}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setSelectedJob(null)}
              className="btn-secondary flex-1 py-3 text-sm" style={{ borderRadius: '10px' }}>Cancel</button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 py-3 text-sm font-display font-bold rounded-[10px] text-white"
              style={{ background: '#e11d48' }}>
              {deleting
                ? <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </span>
                : 'Delete'
              }
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyJobs;