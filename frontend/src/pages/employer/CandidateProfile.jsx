import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Phone, Mail, Clock, Award, 
  CheckCircle2, User, Lock 
} from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const CandidateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSubscribed } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    try {
      const data = await userService.getProfile(id);
      setProfile(data);
    } catch (error) {
      toast.error('Failed to load profile');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-6">
        <div className="flex items-center space-x-4">
          {profile.profile_photo ? (
            <img 
              src={profile.profile_photo} 
              alt={profile.name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-10 h-10 text-gray-400" />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">{profile.name}</h1>
              {profile.is_verified && (
                <CheckCircle2 className="w-5 h-5 text-blue-500 ml-2" />
              )}
              {profile.exam_passed && (
                <Award className="w-5 h-5 text-yellow-500 ml-1" />
              )}
            </div>
            <p className="text-gray-500 flex items-center mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {profile.area && `${profile.area}, `}{profile.city}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-4 py-4 space-y-4">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">About</h3>
          <p className="text-gray-600">
            {profile.bio || 'No bio provided.'}
          </p>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Experience</span>
              <span className="font-medium">{profile.experience_years || 0} years</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Availability</span>
              <Badge>{profile.availability?.replace('_', ' ') || 'Not specified'}</Badge>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills?.length > 0 ? (
              profile.skills.map(skill => (
                <Badge key={skill.id} variant="primary">{skill.name}</Badge>
              ))
            ) : (
              <p className="text-gray-500">No skills listed</p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Badges</h3>
          <div className="space-y-2">
            {profile.is_verified && (
              <div className="flex items-center p-2 bg-blue-50 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-blue-800">Verified Profile</span>
              </div>
            )}
            {profile.exam_passed && (
              <div className="flex items-center p-2 bg-yellow-50 rounded-lg">
                <Award className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800">Skill Certified</span>
              </div>
            )}
            {!profile.is_verified && !profile.exam_passed && (
              <p className="text-gray-500">No badges yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t p-4 safe-bottom">
        {profile.canContact && profile.mobile ? (
          <a href={`tel:${profile.mobile}`} className="block">
            <Button fullWidth icon={Phone}>
              Call {profile.mobile}
            </Button>
          </a>
        ) : (
          <Button 
            fullWidth 
            onClick={() => navigate('/employer/subscription')}
            icon={Lock}
          >
            Subscribe to Contact
          </Button>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;