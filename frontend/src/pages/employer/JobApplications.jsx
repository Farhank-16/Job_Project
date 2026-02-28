import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, CheckCircle2, Award, User, Lock, ChevronRight } from 'lucide-react';
import { jobService } from '../../services/jobService';
import useAuth from '../../context/useAuth';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS = {
  pending:     { bg: '#fefce8', color: '#92400e', label: 'Pending' },
  reviewed:    { bg: '#eff6ff', color: '#1d4ed8', label: 'Reviewed' },
  shortlisted: { bg: '#f0fdf4', color: '#15803d', label: 'Shortlisted' },
  rejected:    { bg: '#fff1f2', color: '#be123c', label: 'Rejected' },
  hired:       { bg: '#f0fdf4', color: '#15803d', label: '🎉 Hired' },
};

const JobApplications = () => {
  const { id: jobId }      = useParams();
  const navigate           = useNavigate();
  const { isSubscribed }   = useAuth();

  const [loading, setLoading]       = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp]   = useState(null);
  const [newStatus, setNewStatus]       = useState('');
  const [updating, setUpdating]         = useState(false);

  useEffect(() => {
    jobService.getJobApplications(jobId)
      .then(({ applications }) => setApplications(applications))
      .catch(() => { toast.error('Failed to load'); navigate('/employer/jobs'); })
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleUpdateStatus = async () => {
    if (!selectedApp || !newStatus) return;
    setUpdating(true);
    try {
      await jobService.updateApplicationStatus(selectedApp.id, newStatus);
      setApplications(p => p.map(a => a.id === selectedApp.id ? { ...a, status: newStatus } : a));
      toast.success('Status updated');
      setSelectedApp(null);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(false); }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="sticky top-14 bg-white border-b border-slate-100 z-30 px-4 py-3">
        <p className="font-display font-bold text-slate-800 text-sm">{applications.length} Applications</p>
      </div>

      {applications.length === 0 ? (
        <EmptyState icon={User} title="No applications yet"
          description="Applications will appear here when candidates apply" />
      ) : (
        <div className="px-4 py-4 space-y-3">
          {applications.map(app => {
            const st = STATUS[app.status] || { bg: '#f1f5f9', color: '#475569', label: app.status };
            return (
              <div key={app.id} className="card-elevated p-4">
                {/* Candidate info */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-display font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
                    {app.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-display font-bold text-slate-900 text-sm truncate">{app.name}</h3>
                      {app.is_verified && <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                      {app.exam_passed  && <Award        className="w-4 h-4 text-amber-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                      <MapPin className="w-3 h-3" />{[app.area, app.city].filter(Boolean).join(', ')}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                {isSubscribed && app.mobile ? (
                  <a href={`tel:${app.mobile}`}
                    className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-3">
                    <Phone className="w-4 h-4" />{app.mobile}
                  </a>
                ) : !isSubscribed && (
                  <button onClick={() => navigate('/employer/subscription')}
                    className="flex items-center gap-2 text-slate-400 text-xs mb-3">
                    <Lock className="w-3.5 h-3.5" /> Subscribe to view contact
                  </button>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/employer/candidates/${app.applicant_id}`)}
                    className="btn-secondary flex-1 py-2.5 text-xs" style={{ borderRadius: '8px' }}>
                    View Profile
                  </button>
                  <button onClick={() => { setSelectedApp(app); setNewStatus(app.status); }}
                    className="btn-primary flex-1 py-2.5 text-xs" style={{ borderRadius: '8px' }}>
                    Update Status
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title="Update Application Status">
        <div className="space-y-4">
          <Select label="Status" value={newStatus} onChange={e => setNewStatus(e.target.value)}
            options={[
              { value: 'pending',     label: 'Pending' },
              { value: 'reviewed',    label: 'Reviewed' },
              { value: 'shortlisted', label: 'Shortlisted' },
              { value: 'rejected',    label: 'Rejected' },
              { value: 'hired',       label: 'Hired' },
            ]} />
          <button onClick={handleUpdateStatus} disabled={updating}
            className="btn-primary w-full py-3.5 text-sm" style={{ borderRadius: '10px' }}>
            {updating
              ? <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </span>
              : 'Update Status'
            }
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default JobApplications;