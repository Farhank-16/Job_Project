import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Briefcase, IndianRupee, CheckCircle2 } from 'lucide-react';
import Badge from '../ui/Badge';

const JobCard = ({ job, showApply = false, onApply }) => {
  const navigate = useNavigate();

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return 'Negotiable';
    if (job.salary_min && job.salary_max) {
      return `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}`;
    }
    return job.salary_min ? `₹${job.salary_min.toLocaleString()}+` : `Up to ₹${job.salary_max.toLocaleString()}`;
  };

  const getJobTypeLabel = () => {
    const types = {
      full_time: 'Full Time',
      part_time: 'Part Time',
      contract: 'Contract',
      daily_wage: 'Daily Wage',
    };
    return types[job.job_type] || job.job_type;
  };

  return (
    <div 
      className="card p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/seeker/jobs/${job.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {job.employer_photo ? (
            <img 
              src={job.employer_photo} 
              alt={job.employer_name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary-600" />
            </div>
          )}
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
            {job.distance && ` • ${job.distance.toFixed(1)} km`}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <IndianRupee className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{formatSalary()} / {job.salary_type || 'month'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="primary">{job.skill_name || 'General'}</Badge>
          <Badge>{getJobTypeLabel()}</Badge>
        </div>
        {job.distance && (
          <span className="text-xs text-gray-500">{job.distance.toFixed(1)} km away</span>
        )}
      </div>
    </div>
  );
};

export default JobCard;