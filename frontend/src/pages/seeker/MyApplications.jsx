import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { userService } from '../../services/userService';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  useEffect(() => {
    loadApplications();
  }, [pagination.page]);

  const loadApplications = async () => {
    try {
      const response = await userService.getAppliedJobs(pagination.page, 10);
      setApplications(prev => 
        pagination.page === 1 ? response.applications : [...prev, ...response.applications]
      );
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', label: 'Pending' },
      reviewed: { variant: 'info', label: 'Reviewed' },
      shortlisted: { variant: 'success', label: 'Shortlisted' },
      rejected: { variant: 'danger', label: 'Rejected' },
      hired: { variant: 'success', label: 'Hired' },
    };
    const config = statusConfig[status] || { variant: 'default', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading && pagination.page === 1) {
    return (
      <div className="px-4 py-4">
        <SkeletonList count={5} />
      </div>
    );
  }

  if (!loading && applications.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No applications yet"
        description="Start applying for jobs to see them here"
        action={() => navigate('/seeker/jobs')}
        actionLabel="Find Jobs"
      />
    );
  }

  return (
    <div className="px-4 py-4 space-y-3">
      {applications.map((app) => (
        <div 
          key={app.id}
          className="card p-4 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/seeker/jobs/${app.job_id}`)}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{app.title}</h3>
              <p className="text-sm text-gray-500">{app.employer_name}</p>
            </div>
            {getStatusBadge(app.status)}
          </div>

          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(app.applied_at).toLocaleDateString()}
            </span>
            <span>{app.job_city}</span>
          </div>

          {app.skill_name && (
            <div className="mt-2">
              <Badge variant="primary" size="xs">{app.skill_name}</Badge>
            </div>
          )}
        </div>
      ))}

      {pagination.page < pagination.pages && (
        <button
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          className="w-full py-3 text-center text-primary-600 font-medium"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default MyApplications;