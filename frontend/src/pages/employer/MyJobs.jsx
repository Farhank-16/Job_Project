import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Users, Eye, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { jobService } from '../../services/jobService';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const MyJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showActions, setShowActions] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const { jobs } = await jobService.getMyJobs(1, 50);
      setJobs(jobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (job) => {
    try {
      await jobService.updateJob(job.id, { isActive: !job.is_active });
      setJobs(prev => prev.map(j => 
        j.id === job.id ? { ...j, is_active: !j.is_active } : j
      ));
      toast.success(`Job ${job.is_active ? 'deactivated' : 'activated'}`);
    } catch (error) {
      toast.error('Failed to update job');
    }
    setShowActions(null);
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    
    setDeleting(true);
    try {
      await jobService.deleteJob(selectedJob.id);
      setJobs(prev => prev.filter(j => j.id !== selectedJob.id));
      toast.success('Job deleted');
      setSelectedJob(null);
    } catch (error) {
      toast.error('Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-4">
        <SkeletonList count={5} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-14 bg-white border-b z-30 px-4 py-3 flex justify-between items-center">
        <h2 className="font-semibold text-gray-900">{jobs.length} Jobs</h2>
        <Button size="sm" onClick={() => navigate('/employer/post-job')} icon={Plus}>
          Post Job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <EmptyState
          title="No jobs posted"
          description="Post your first job to start hiring"
          action={() => navigate('/employer/post-job')}
          actionLabel="Post Job"
        />
      ) : (
        <div className="px-4 py-4 space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate(`/employer/jobs/${job.id}/applications`)}
                >
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.area && `${job.area}, `}{job.city}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={job.is_active ? 'success' : 'default'}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="relative">
                    <button
                      onClick={() => setShowActions(showActions === job.id ? null : job.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    {showActions === job.id && (
                      <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-1 min-w-[150px] z-10">
                        <button
                          onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                        >
                          <Edit2 className="w-4 h-4 mr-2" /> Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(job)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          {job.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setShowActions(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {job.applications_count || 0} applications
                </span>
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {job.views_count || 0} views
                </span>
              </div>

              {job.skill_name && (
                <div className="mt-3">
                  <Badge variant="primary" size="xs">{job.skill_name}</Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title="Delete Job"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete <strong>{selectedJob?.title}</strong>? This action cannot be undone.
          </p>
          <div className="flex space-x-3">
            <Button variant="secondary" fullWidth onClick={() => setSelectedJob(null)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MyJobs;