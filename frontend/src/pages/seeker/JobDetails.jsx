import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Clock, IndianRupee, Phone,
  CheckCircle2, Users, ArrowRight
} from 'lucide-react';
import { jobService } from '../../services/jobService';
import useAuth from '../../context/useAuth';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

// Employer ka naam ka pehla letter
const NameAvatar = ({ name }) => {
  const letter = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div className="w-16 h-16 rounded-xl bg-primary-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
      {letter}
    </div>
  );
};

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSubscribed } = useAuth();

  const [job, setJob]             = useState(null);
  const [loading, setLoading]     = useState(true);
  const [applying, setApplying]   = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter]       = useState('');

  useEffect(() => { loadJob(); }, [id]);

  const loadJob = async () => {
    try {
      const data = await jobService.getJob(id);
      setJob(data);
    } catch (error) {
      toast.error('Failed to load job details');
      navigate('/seeker/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!isSubscribed) {
      toast.error('Please subscribe to apply for jobs');
      navigate('/seeker/subscription');
      return;
    }
    setApplying(true);
    try {
      await jobService.applyForJob(id, coverLetter);
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
      loadJob();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return 'Negotiable';
    if (job.salary_min && job.salary_max)
      return `₹${job.salary_min.toLocaleString()} - ₹${job.salary_max.toLocaleString()}`;
    return job.salary_min
      ? `₹${job.salary_min.toLocaleString()}+`
      : `Up to ₹${job.salary_max.toLocaleString()}`;
  };

  // Multiple skills support
  const skillNames = (() => {
    if (!job) return [];
    if (Array.isArray(job.skill_names)) return job.skill_names;
    if (typeof job.skill_names === 'string') return job.skill_names.split(',').map(s => s.trim());
    if (job.skill_name) return [job.skill_name];
    return [];
  })();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!job)    return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b">
        <div className="flex items-start space-x-4">
          <NameAvatar name={job.employer_name} />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
            <div className="flex items-center mt-1">
              <p className="text-gray-600">{job.employer_name}</p>
              {job.employer_verified && (
                <CheckCircle2 className="w-4 h-4 text-blue-500 ml-2" />
              )}
            </div>
          </div>
        </div>

        {/* Skills + type tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {skillNames.length > 0
            ? skillNames.map((name, i) => <Badge key={i} variant="primary">{name}</Badge>)
            : <Badge variant="primary">General</Badge>
          }
          <Badge>{job.job_type?.replace('_', ' ')}</Badge>
          {job.vacancies > 1 && <Badge variant="info">{job.vacancies} openings</Badge>}
        </div>
      </div>

      {/* Details */}
      <div className="px-4 py-4 space-y-4">
        <div className="card p-4 space-y-3">
          <div className="flex items-center">
            <IndianRupee className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Salary</p>
              <p className="font-medium">{formatSalary()} / {job.salary_type || 'month'}</p>
            </div>
          </div>
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">
                {[job.area, job.city].filter(Boolean).join(', ')}
                {job.distance != null && ` (${Number(job.distance).toFixed(1)} km away)`}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Experience Required</p>
              <p className="font-medium">{job.experience_required || 0}+ years</p>
            </div>
          </div>
          <div className="flex items-center">
            <Users className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="text-sm text-gray-500">Availability</p>
              <p className="font-medium">{job.availability_required?.replace('_', ' ') || 'Flexible'}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Job Description</h3>
          <p className="text-gray-600 whitespace-pre-line">
            {job.description || 'No description provided.'}
          </p>
        </div>

        {isSubscribed && job.employer_mobile && (
          <div className="card p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Contact Employer</h3>
            <a href={`tel:${job.employer_mobile}`} className="flex items-center text-primary-600">
              <Phone className="w-5 h-5 mr-2" />
              {job.employer_mobile}
            </a>
          </div>
        )}

        <div className="flex space-x-4 text-sm text-gray-500">
          <span>{job.views_count || 0} views</span>
          <span>{job.applications_count || 0} applications</span>
          <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t p-4 safe-bottom">
        {job.hasApplied ? (
          <Button fullWidth disabled variant="secondary">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Already Applied
          </Button>
        ) : isSubscribed ? (
          <Button fullWidth onClick={() => setShowApplyModal(true)}>Apply Now</Button>
        ) : (
          <Button fullWidth onClick={() => navigate('/seeker/subscription')} icon={ArrowRight} iconPosition="right">
            Subscribe to Apply
          </Button>
        )}
      </div>

      {/* Apply Modal */}
      <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Apply for Job">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter (Optional)
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Introduce yourself and why you're a good fit..."
              rows={4}
              className="input"
            />
          </div>
          <Button fullWidth loading={applying} onClick={handleApply}>
            Submit Application
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default JobDetails;