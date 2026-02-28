import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, IndianRupee, Phone, CheckCircle2, Users, ArrowRight, BadgeCheck } from 'lucide-react';
import { jobService } from '../../services/jobService';
import useAuth from '../../context/useAuth';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const SAL_TYPE = { hourly: '/hr', daily: '/day', weekly: '/wk', monthly: '/mo' };

const JobDetails = () => {
  const { id }              = useParams();
  const navigate            = useNavigate();
  const { isSubscribed }    = useAuth();

  const [job, setJob]           = useState(null);
  const [loading, setLoading]   = useState(true);
  const [applying, setApplying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => { loadJob(); }, [id]);

  const loadJob = async () => {
    try {
      setJob(await jobService.getJob(id));
    } catch {
      toast.error('Failed to load job');
      navigate('/seeker/jobs');
    } finally { setLoading(false); }
  };

  const handleApply = async () => {
    if (!isSubscribed) { toast.error('Subscribe to apply'); navigate('/seeker/subscription'); return; }
    setApplying(true);
    try {
      await jobService.applyForJob(id, coverLetter);
      toast.success('Application submitted!');
      setShowModal(false);
      loadJob();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to apply');
    } finally { setApplying(false); }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!job)    return null;

  const skillNames = (() => {
    if (Array.isArray(job.skill_names))        return job.skill_names;
    if (typeof job.skill_names === 'string')   return job.skill_names.split(',').map(s => s.trim());
    if (job.skill_name)                         return [job.skill_name];
    return [];
  })();

  const salary = (() => {
    if (!job.salary_min && !job.salary_max) return 'Negotiable';
    if (job.salary_min && job.salary_max)
      return `₹${Number(job.salary_min).toLocaleString('en-IN')} – ₹${Number(job.salary_max).toLocaleString('en-IN')}`;
    return job.salary_min ? `₹${Number(job.salary_min).toLocaleString('en-IN')}+`
      : `Up to ₹${Number(job.salary_max).toLocaleString('en-IN')}`;
  })();

  const INFO = [
    { icon: IndianRupee, label: 'Salary',      value: `${salary} ${SAL_TYPE[job.salary_type] || '/mo'}` },
    { icon: MapPin,      label: 'Location',    value: [job.area, job.city].filter(Boolean).join(', ') + (job.distance != null ? ` · ${Number(job.distance).toFixed(1)} km` : '') },
    { icon: Clock,       label: 'Experience',  value: `${job.experience_required || 0}+ years` },
    { icon: Users,       label: 'Availability',value: job.availability_required?.replace('_', ' ') || 'Flexible' },
    ...(job.job_duration ? [{ icon: Clock, label: 'Duration', value: job.job_duration }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-28">

      {/* Header card */}
      <div className="bg-white px-4 py-5 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-display font-extrabold text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            {job.employer_name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-extrabold text-slate-900 leading-tight">{job.title}</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-slate-500 text-sm">{job.employer_name}</span>
              {job.employer_verified && <BadgeCheck className="w-4 h-4 text-blue-500" />}
            </div>
          </div>
        </div>

        {/* Skill + type badges */}
        <div className="flex flex-wrap gap-1.5 mt-4">
          {skillNames.length > 0
            ? skillNames.map((n, i) => <span key={i} className="badge badge-blue">{n}</span>)
            : <span className="badge badge-gray">General</span>
          }
          <span className="badge badge-gray">{job.job_type?.replace('_', ' ')}</span>
          {job.vacancies > 1 && <span className="badge badge-amber">{job.vacancies} openings</span>}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Info card */}
        <div className="card-elevated p-4 divide-y divide-slate-50">
          {INFO.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="font-semibold text-slate-800 text-sm">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="card-elevated p-4">
          <h3 className="font-display font-bold text-slate-800 text-sm mb-2">Job Description</h3>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
            {job.description || 'No description provided.'}
          </p>
        </div>

        {/* Contact (subscribed only) */}
        {isSubscribed && job.employer_mobile && (
          <div className="card-elevated p-4">
            <h3 className="font-display font-bold text-slate-800 text-sm mb-3">Contact Employer</h3>
            <a href={`tel:${job.employer_mobile}`}
              className="flex items-center gap-2 text-blue-600 font-semibold text-sm">
              <Phone className="w-4 h-4" />{job.employer_mobile}
            </a>
          </div>
        )}

        {/* Meta */}
        <div className="flex gap-4 text-xs text-slate-400">
          <span>{job.views_count || 0} views</span>
          <span>{job.applications_count || 0} applications</span>
          <span>Posted {new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
        </div>
      </div>

      {/* Bottom action */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-slate-100 p-4 safe-bottom">
        {job.hasApplied ? (
          <button disabled
            className="w-full py-3.5 rounded-xl font-display font-bold text-slate-400 bg-slate-100 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" /> Already Applied
          </button>
        ) : isSubscribed ? (
          <button onClick={() => setShowModal(true)}
            className="btn-primary w-full py-4 text-base justify-between" style={{ borderRadius: '12px' }}>
            <span>Apply Now</span><ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button onClick={() => navigate('/seeker/subscription')}
            className="btn-primary w-full py-4 text-base justify-between" style={{ borderRadius: '12px' }}>
            <span>Subscribe to Apply</span><ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Apply Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Apply for this Job">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Cover Letter <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
              placeholder="Introduce yourself and why you're a good fit..."
              rows={4} className="input" />
          </div>
          <button onClick={handleApply} disabled={applying}
            className="btn-primary w-full py-3.5 text-sm" style={{ borderRadius: '10px' }}>
            {applying
              ? <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              : 'Submit Application'
            }
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default JobDetails;