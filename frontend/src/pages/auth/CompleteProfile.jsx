import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { skillService } from '../../services/skillService';
import { useLocation as useGeoLocation } from '../../hooks/useLocation';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const CompleteProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const { getCurrentLocation, loading: locationLoading } = useGeoLocation();

  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [formData, setFormData] = useState({
    area: '',
    city: '',
    state: '',
    pincode: '',
    latitude: null,
    longitude: null,
    experienceYears: 0,
    availability: 'immediate',
    selectedSkills: [],
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

  const handleGetLocation = async () => {
    try {
      const coords = await getCurrentLocation();
      setFormData(prev => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
      toast.success('Location captured!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSkillToggle = (skillId) => {
    setFormData(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skillId)
        ? prev.selectedSkills.filter(id => id !== skillId)
        : [...prev.selectedSkills, skillId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.city) {
      toast.error('Please enter your city');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast.error('Please capture your location');
      return;
    }

    setLoading(true);
    try {
      const profileData = {
        area: formData.area,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        latitude: formData.latitude,
        longitude: formData.longitude,
        experienceYears: formData.experienceYears,
        availability: formData.availability,
        skills: formData.selectedSkills.map(skillId => ({
          skillId,
          proficiency: 'beginner',
        })),
      };

      await userService.updateProfile(profileData);
      updateUser({ profileCompleted: true });
      
      toast.success('Profile completed!');
      navigate(user.role === 'employer' ? '/employer' : '/seeker');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">Help us match you better</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Section */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Your Location</h3>
            
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={handleGetLocation}
              loading={locationLoading}
              icon={Navigation}
            >
              {formData.latitude ? 'Location Captured ✓' : 'Capture My Location'}
            </Button>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Area/Village"
                value={formData.area}
                onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                placeholder="Enter area"
              />
              <Input
                label="City/Town"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Enter city"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="State"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="Enter state"
              />
              <Input
                label="Pincode"
                value={formData.pincode}
                onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                placeholder="Enter pincode"
                inputMode="numeric"
                maxLength={6}
              />
            </div>
          </div>

          {/* Skills Section (for job seekers) */}
          {user?.role === 'job_seeker' && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Your Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => handleSkillToggle(skill.id)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-colors
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
          )}

          {/* Experience & Availability (for job seekers) */}
          {user?.role === 'job_seeker' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                label="Years of Experience"
                value={formData.experienceYears}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  experienceYears: parseInt(e.target.value) || 0 
                }))}
                min={0}
                max={50}
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
          )}

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
          >
            Complete Profile
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;