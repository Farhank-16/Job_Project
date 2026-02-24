import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, MapPin, Phone, Mail, Award, CheckCircle2, 
  Edit2, Camera, Crown, LogOut, Settings 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { skillService } from '../../services/skillService';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import toast from 'react-hot-toast';

const SeekerProfile = () => {
  const { user, logout, refreshUser, isVerified, hasExamPassed, isSubscribed } = useAuth();
  const navigate = useNavigate();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    experienceYears: user?.experienceYears || 0,
    availability: user?.availability || 'immediate',
    expectedSalaryMin: user?.expectedSalaryMin || '',
    expectedSalaryMax: user?.expectedSalaryMax || '',
    selectedSkills: user?.skills?.map(s => s.id) || [],
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const { skills } = await skillService.getSkills();
      setSkills(skills);
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await userService.updateProfile({
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        experienceYears: formData.experienceYears,
        availability: formData.availability,
        expectedSalaryMin: formData.expectedSalaryMin,
        expectedSalaryMax: formData.expectedSalaryMax,
        skills: formData.selectedSkills.map(id => ({ skillId: id })),
      });
      
      await refreshUser();
      toast.success('Profile updated successfully');
      setShowEditModal(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await userService.uploadPhoto(file);
      await refreshUser();
      toast.success('Photo updated');
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Profile Header */}
      <div className="bg-white px-4 py-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {user?.profilePhoto ? (
              <img 
                src={user.profilePhoto} 
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="w-10 h-10 text-primary-600" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer">
              <Camera className="w-4 h-4 text-white" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center">
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              {isVerified && (
                <CheckCircle2 className="w-5 h-5 text-blue-500 ml-2" />
              )}
              {hasExamPassed && (
                <Award className="w-5 h-5 text-yellow-500 ml-1" />
              )}
            </div>
            <p className="text-gray-500">+91 {user?.mobile}</p>
            <div className="flex items-center mt-1">
              {isSubscribed ? (
                <Badge variant="success">Premium</Badge>
              ) : (
                <Badge>Free</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4 space-y-3">
        <button
          onClick={() => setShowEditModal(true)}
          className="card p-4 w-full flex items-center justify-between"
        >
          <div className="flex items-center">
            <Edit2 className="w-5 h-5 text-gray-400 mr-3" />
            <span className="font-medium">Edit Profile</span>
          </div>
          <span className="text-gray-400">→</span>
        </button>

        {!isVerified && (
          <button
            onClick={() => navigate('/seeker/subscription')}
            className="card p-4 w-full flex items-center justify-between bg-blue-50 border-blue-200"
          >
            <div className="flex items-center">
              <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3" />
              <span className="font-medium text-blue-900">Get Verified Badge</span>
            </div>
            <span className="text-blue-400">→</span>
          </button>
        )}

        {!hasExamPassed && (
          <button
            onClick={() => navigate('/seeker/exams')}
            className="card p-4 w-full flex items-center justify-between bg-yellow-50 border-yellow-200"
          >
            <div className="flex items-center">
              <Award className="w-5 h-5 text-yellow-600 mr-3" />
              <span className="font-medium text-yellow-900">Take Skill Exam</span>
            </div>
            <span className="text-yellow-400">→</span>
          </button>
        )}

        {!isSubscribed && (
          <button
            onClick={() => navigate('/seeker/subscription')}
            className="card p-4 w-full flex items-center justify-between bg-purple-50 border-purple-200"
          >
            <div className="flex items-center">
              <Crown className="w-5 h-5 text-purple-600 mr-3" />
              <span className="font-medium text-purple-900">Upgrade to Premium</span>
            </div>
            <span className="text-purple-400">→</span>
          </button>
        )}
      </div>

      {/* Profile Details */}
      <div className="px-4 py-4 space-y-4">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">About</h3>
          <p className="text-gray-600">
            {user?.bio || 'No bio added yet. Tap Edit Profile to add one.'}
          </p>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-3 text-gray-400" />
              {user?.area && `${user.area}, `}{user?.city || 'Location not set'}
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-3 text-gray-400" />
              {user?.email || 'Email not set'}
            </div>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user?.skills?.length > 0 ? (
              user.skills.map(skill => (
                <Badge key={skill.id} variant="primary">{skill.name}</Badge>
              ))
            ) : (
              <p className="text-gray-500">No skills added yet</p>
            )}
          </div>
        </div>

        <button
          onClick={logout}
          className="card p-4 w-full flex items-center text-red-600"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
        size="lg"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              About You
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="input"
              placeholder="Tell employers about yourself..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Experience (years)"
              value={formData.experienceYears}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                experienceYears: parseInt(e.target.value) || 0 
              }))}
            />
            <Select
              label="Availability"
              value={formData.availability}
              onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
              options={[
                { value: 'immediate', label: 'Immediate' },
                { value: 'within_week', label: 'Within a week' },
                { value: 'within_month', label: 'Within a month' },
                { value: 'not_available', label: 'Not available' },
              ]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      selectedSkills: prev.selectedSkills.includes(skill.id)
                        ? prev.selectedSkills.filter(id => id !== skill.id)
                        : [...prev.selectedSkills, skill.id],
                    }));
                  }}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                    ${formData.selectedSkills.includes(skill.id)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>

          <Button
            fullWidth
            onClick={handleUpdateProfile}
            loading={loading}
          >
            Save Changes
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SeekerProfile;