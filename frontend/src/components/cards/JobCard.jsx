import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, IndianRupee, CheckCircle2 } from 'lucide-react';
import Badge from '../ui/Badge';

// Naam ka pehla letter — employer ke liye
const NameAvatar = ({ name, size = 'md' }) => {
  const letter = name ? name.charAt(0).toUpperCase() : '?';
  const sizeClass = size === 'md' ? 'w-12 h-12 text-base' : 'w-16 h-16 text-xl';
  return (
    <div className={`${sizeClass} rounded-full bg-primary-500 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {letter}
    </div>
  );
};

const JobCard = ({ job }) => {
  const navigate = useNavigate();

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return 'Negotiable';
    if (job.salary_min && job.salary_max) {
      return `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}`;
    }
    return job.salary_min
      ? `₹${job.salary_min.toLocaleString()}+`
      : `Up to ₹${job.salary_max.toLocaleString()}`;
  };

  const getJobTypeLabel = () => {
    const types = {
      full_time:  'Full Time',
      part_time:  'Part Time',
      contract:   'Contract',
      daily_wage: 'Daily Wage',
    };
    return types[job.job_type] || job.job_type;
  };

  // Multiple skills support:
  // Backend se ya toh array aata hai ya comma-separated string
  const skillNames = (() => {
    if (!job.skill_names && !job.skill_name) return [];
    if (Array.isArray(job.skill_names)) return job.skill_names;
    if (typeof job.skill_names === 'string') return job.skill_names.split(',').map(s => s.trim());
    if (job.skill_name) return [job.skill_name]; // fallback single skill
    return [];
  })();

  return (
    <div
      className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/seeker/jobs/${job.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <NameAvatar name={job.employer_name} size="md" />
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-1">{job.title}</h3>
            <p className="text-sm text-gray-500">{job.employer_name}</p>
          </div>
        </div>
        {job.employer_verified && (
          <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
        )}
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="line-clamp-1">
            {job.area && `${job.area}, `}{job.city}
            {job.distance != null && ` • ${Number(job.distance).toFixed(1)} km`}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <IndianRupee className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{formatSalary()} / {job.salary_type || 'month'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center flex-wrap gap-1">
          {/* Multiple skills badges */}
          {skillNames.length > 0
            ? skillNames.map((name, i) => (
                <Badge key={i} variant="primary">{name}</Badge>
              ))
            : <Badge variant="primary">General</Badge>
          }
          <Badge>{getJobTypeLabel()}</Badge>
        </div>
        {job.distance != null && (
          <span className="text-xs text-gray-500">{Number(job.distance).toFixed(1)} km away</span>
        )}
      </div>
    </div>
  );
};

export default JobCard;