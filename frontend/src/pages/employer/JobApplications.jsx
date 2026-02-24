import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Clock, Phone, CheckCircle2, Award, 
  User, ChevronRight, Lock 
} from 'lucide-react';
import { jobService } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const JobApplications = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { isSubscribed } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadApplications();
  }, [jobId]);

  const loadApplications = async () => {
    try {
      const { applications } = await jobService.getJobApplications(jobId);
      setApplications(applications);
    } catch (error) {
      toast.error('Failed to load applications');
      navigate('/employer/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedApp || !newStatus) return;
    
    setUpdating(true);
    try {
      await jobService.updateApplicationStatus(selectedApp.id, newStatus);
      setApplications(prev => prev.map(app =>
        app.id === selectedApp.id ? { ...app, status: newStatus } : app
      ));
      toast.success('Status updated');
      setSelectedApp(null);
      setNewStatus('');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { variant: 'warning', label: 'Pending' },
      reviewed: { variant: 'info', label: 'Reviewed' },
      shortlisted: { variant: 'success', label: 'Shortlisted' },
      rejected: { variant: 'danger', label: 'Rejected' },
      hired: { variant: 'success', label: 'Hired' },
    };
    const c = config[status] || { variant: 'default', label: status };
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-14 bg-white border-b z-30 px-4 py-3">
        <h2 className="font-semibold text-gray-900">{applications.length} Applications</h2>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={User}
          title="No applications yet"
          description="Applications will appear here when candidates apply"
        />
      ) : (
        <div className="px-4 py-4 space-y-3">
          {applications.map((app) => (
            <div key={app.id} className="card p-4">
              <div className="flex items-start space-x-3">
                {app.profile_photo ? (
                  <img 
                    src={app.profile_photo} 
                    alt={app.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-7 h-7 text-gray-400" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900 truncate">{app.name}</h3>
                    {app.is_verified && <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                    {app.exam_passed && <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span className="truncate">{app.area && `${app.area}, `}{app.city}</span>
                  </div>

                  <div className="flex items-center space-x-3 mt-2">
                    {getStatusBadge(app.status)}
                    <span className="text-xs text-gray-400">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              {isSubscribed && app.mobile ? (
                <a 
                  href={`tel:${app.mobile}`}
                  className="mt-3 flex items-center text-primary-600"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  {app.mobile}
                </a>
              ) : !isSubscribed && (
                <button
                  onClick={() => navigate('/employer/subscription')}
                  className="mt-3 flex items-center text-gray-500"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Subscribe to view contact
                </button>
              )}

              {/* Actions */}
              <div className="flex space-x-2 mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/employer/candidates/${app.applicant_id}`)}
                >
                  View Profile
                </Button>
                <Button
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setSelectedApp(app);
                    setNewStatus(app.status);
                  }}
                >
                  Update Status
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Status Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title="Update Application Status"
      >
        <div className="space-y-4">
          <Select
            label="Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'reviewed', label: 'Reviewed' },
              { value: 'shortlisted', label: 'Shortlisted' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'hired', label: 'Hired' },
            ]}
          />
          <Button fullWidth loading={updating} onClick={handleUpdateStatus}>
            Update
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default JobApplications;