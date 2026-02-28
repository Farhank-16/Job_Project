import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, IndianRupee, Clock, BadgeCheck, Layers } from 'lucide-react';

const JOB_TYPE = { full_time: 'Full Time', part_time: 'Part Time', contract: 'Contract', daily_wage: 'Daily Wage' };
const SAL_TYPE = { hourly: '/hr', daily: '/day', weekly: '/wk', monthly: '/mo' };

const fmt = (n) => Number(n).toLocaleString('en-IN');

const formatSalary = (job) => {
  if (!job.salary_min && !job.salary_max) return 'Negotiable';
  if (job.salary_min && job.salary_max)   return `₹${fmt(job.salary_min)} – ₹${fmt(job.salary_max)}`;
  return job.salary_min ? `₹${fmt(job.salary_min)}+` : `Up to ₹${fmt(job.salary_max)}`;
};

const Avatar = ({ name, size = 44 }) => (
  <div className="rounded-xl flex items-center justify-center text-white font-display font-bold flex-shrink-0"
    style={{ width: size, height: size, fontSize: size * 0.36,
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
    {name?.charAt(0).toUpperCase() || '?'}
  </div>
);

const JobCard = ({ job }) => {
  const navigate = useNavigate();
  const skills = (() => {
    if (!job.skill_name && !job.skill_names) return [];
    if (Array.isArray(job.skill_names))       return job.skill_names;
    if (typeof job.skill_names === 'string')  return job.skill_names.split(',').map(s => s.trim());
    return [job.skill_name];
  })();

  return (
    <div className="card-elevated p-4 cursor-pointer active:scale-[0.98] transition-transform"
      onClick={() => navigate(`/seeker/jobs/${job.id}`)}>

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar name={job.employer_name} size={44} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-slate-900 text-sm leading-tight line-clamp-1">
              {job.title}
            </h3>
            {job.employer_verified && <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />}
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">{job.employer_name}</p>
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">
            {[job.area, job.city].filter(Boolean).join(', ')}
            {job.distance != null && ` · ${Number(job.distance).toFixed(1)} km`}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <IndianRupee className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="font-semibold text-slate-700">{formatSalary(job)}</span>
          <span className="text-slate-400">{SAL_TYPE[job.salary_type] || '/mo'}</span>
        </div>
        {job.job_duration && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{job.job_duration}</span>
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 items-center">
        {skills.slice(0, 2).map((s, i) => <span key={i} className="badge badge-blue">{s}</span>)}
        {!skills.length && <span className="badge badge-gray">General</span>}
        <span className="badge badge-gray">{JOB_TYPE[job.job_type] || job.job_type}</span>
        {job.vacancies > 1 && <span className="badge badge-amber">{job.vacancies} openings</span>}
      </div>
    </div>
  );
};

export default JobCard;