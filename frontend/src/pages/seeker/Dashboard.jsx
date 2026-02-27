import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Briefcase, Award, CheckCircle2, 
  Crown, ArrowRight, MapPin 
} from 'lucide-react';
import useAuth from '../../context/useAuth';
import { jobService } from '../../services/jobService';
import JobCard from '../../components/cards/JobCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonList } from '../../components/ui/Skeleton';

const SeekerDashboard = () => {
  const { user, isSubscribed, isVerified, hasExamPassed } = useAuth();
  const navigate = useNavigate();
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendedJobs();
  }, []);

  const loadRecommendedJobs = async () => {
    try {
      const { jobs } = await jobService.getRecommendedJobs();
      setRecommendedJobs(jobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const profileCompletion = () => {
    let score = 0;
    if (user?.name) score += 20;
    if (user?.city) score += 20;
    if (user?.skills?.length > 0) score += 20;
    if (isVerified) score += 20;
    if (hasExamPassed) score += 20;
    return score;
  };

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Welcome Card */}
      <div className="card p-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">Hello, {user?.name || 'User'}!</h2>
            <p className="text-primary-100 mt-1">
              {isSubscribed ? 'Premium Member' : 'Free Account'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isVerified && (
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
            {hasExamPassed && (
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>

        {!isSubscribed && (
          <button
            onClick={() => navigate('/seeker/subscription')}
            className="mt-4 w-full py-2.5 bg-white text-primary-600 rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            <Crown className="w-5 h-5" />
            <span>Upgrade to Apply Jobs</span>
          </button>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/seeker/jobs')}
          className="card p-4 text-left hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900">Find Jobs</h3>
          <p className="text-sm text-gray-500">Search nearby</p>
        </button>

        <button
          onClick={() => navigate('/seeker/applications')}
          className="card p-4 text-left hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <Briefcase className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-medium text-gray-900">My Applications</h3>
          <p className="text-sm text-gray-500">Track status</p>
        </button>

        <button
          onClick={() => navigate('/seeker/exams')}
          className="card p-4 text-left hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
            <Award className="w-5 h-5 text-yellow-600" />
          </div>
          <h3 className="font-medium text-gray-900">Skill Exams</h3>
          <p className="text-sm text-gray-500">Get certified</p>
        </button>

        <button
          onClick={() => navigate('/seeker/subscription')}
          className="card p-4 text-left hover:shadow-md transition-shadow"
        >
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <Crown className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-medium text-gray-900">Subscription</h3>
          <p className="text-sm text-gray-500">{isSubscribed ? 'Active' : 'Upgrade'}</p>
        </button>
      </div>

      {/* Profile Completion */}
      {profileCompletion() < 100 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Complete Your Profile</h3>
            <span className="text-sm font-medium text-primary-600">{profileCompletion()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div 
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${profileCompletion()}%` }}
            />
          </div>
          <button
            onClick={() => navigate('/seeker/profile')}
            className="text-sm text-primary-600 font-medium"
          >
            Complete now →
          </button>
        </div>
      )}

      {/* Recommended Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recommended for You</h3>
          <button 
            onClick={() => navigate('/seeker/jobs')}
            className="text-sm text-primary-600 font-medium"
          >
            See all
          </button>
        </div>

        {loading ? (
          <SkeletonList count={3} />
        ) : recommendedJobs.length > 0 ? (
          <div className="space-y-3">
            {recommendedJobs.slice(0, 5).map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-1">No jobs nearby</h4>
            <p className="text-sm text-gray-500 mb-4">
              Complete your profile to get personalized recommendations
            </p>
            <Button onClick={() => navigate('/seeker/jobs')} variant="secondary" size="sm">
              Browse All Jobs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeekerDashboard;