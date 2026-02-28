import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, CheckCircle2 } from 'lucide-react';
import useAuth from '../../context/useAuth';
import { userService } from '../../services/userService';
import { skillService } from '../../services/skillService';
import { useLocation as useGeoLocation } from '../../hooks/useLocation';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const Section = ({ title, children }) => (
  <div className="card-elevated p-4 space-y-4">
    <h3 className="font-display font-bold text-gray-800 text-sm uppercase tracking-wide ">
      {title}
    </h3>
    {children}
  </div>
);

const CompleteProfile = () => {
  const { user, updateUser }                              = useAuth();
  const navigate                                          = useNavigate();
  const { getCurrentLocation, loading: locationLoading } = useGeoLocation();

  const [loading, setLoading] = useState(false);
  const [skills, setSkills]   = useState([]);
  const [formData, setFormData] = useState({
    area: '', city: '', state: '', pincode: '',
    latitude: null, longitude: null,
    experienceYears: 0,
    availability: 'immediate',
    selectedSkills: [],
  });

  useEffect(() => {
    skillService.getSkills().then(({ skills }) => setSkills(skills)).catch(console.error);
  }, []);

  const set = (key) => (e) => setFormData(p => ({ ...p, [key]: e.target.value }));

  const handleGetLocation = async () => {
    try {
      const coords = await getCurrentLocation();
      setFormData(p => ({ ...p, latitude: coords.latitude, longitude: coords.longitude }));
      toast.success('Location mil gayi!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleSkill = (id) =>
    setFormData(p => ({
      ...p,
      selectedSkills: p.selectedSkills.includes(id)
        ? p.selectedSkills.filter(s => s !== id)
        : [...p.selectedSkills, id],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.city)                          return toast.error('City daalo');
    if (!formData.latitude || !formData.longitude) return toast.error('Location capture karo');

    setLoading(true);
    try {
      await userService.updateProfile({
        ...formData,
        skills: formData.selectedSkills.map(skillId => ({ skillId, proficiency: 'beginner' })),
      });
      updateUser({ profileCompleted: true });
      toast.success('Profile complete ho gayi!');
      navigate(user.role === 'employer' ? '/employer' : '/seeker');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Profile save nahi hui');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top banner */}
      <div className="bg-brand px-6 pt-8 pb-10">
        <p className="text-green-200 text-xs font-semibold uppercase tracking-wider mb-1">Step 1 of 1</p>
        <h1 className="font-display text-2xl font-black text-white"> Complete Your Profile  </h1>
        <p className="text-green-100 text-sm mt-1">For Better job matches </p>
      </div>

      <form onSubmit={handleSubmit} className="px-4 -mt-4 pb-8 space-y-4">

        {/* Location */}
        <Section title="Your Location">
          <button
            type="button"
            onClick={handleGetLocation}
            disabled={locationLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-display font-bold text-sm transition-all"
            style={{
              borderColor: formData.latitude ? '#16a34a' : '#d1d5db',
              background:  formData.latitude ? '#f0fdf4' : 'white',
              color:       formData.latitude ? '#16a34a' : '#374151',
            }}
          >
            {locationLoading
              ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              : formData.latitude
                ? <CheckCircle2 className="w-4 h-4" />
                : <Navigation className="w-4 h-4" />
            }
            {formData.latitude ? 'Location is Captured ✓' : 'Capture My Location'}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Area / Village" value={formData.area}    onChange={set('area')}    placeholder="Area" />
            <Input label="City / Town *"  value={formData.city}    onChange={set('city')}    placeholder="City" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="State"   value={formData.state}   onChange={set('state')}   placeholder="State" />
            <Input label="Pincode" value={formData.pincode} onChange={set('pincode')} placeholder="000000" inputMode="numeric" maxLength={6} />
          </div>
        </Section>

        {/* Skills — only for seekers */}
        {user?.role === 'job_seeker' && (
          <Section title="Your Skills">
            <p className="text-xs text-gray-500 -mt-1">Choose skills </p>
            <div className="flex flex-wrap gap-2">
              {skills.map(skill => {
                const selected = formData.selectedSkills.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    className="px-3 py-1.5 rounded-full text-sm font-display font-bold transition-all"
                    style={{
                      background:  selected ? '#16a34a' : '#f3f4f6',
                      color:       selected ? 'white'   : '#374151',
                      boxShadow:   selected ? '0 2px 8px rgba(22,163,74,0.25)' : 'none',
                    }}
                  >
                    {selected && '✓ '}{skill.name}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* Experience — only for seekers */}
        {user?.role === 'job_seeker' && (
          <Section title="Experience">
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                label="Experience (In Years)"
                value={formData.experienceYears}
                onChange={(e) => setFormData(p => ({ ...p, experienceYears: parseInt(e.target.value) || 0 }))}
                min={0} max={50}
              />
              <Select
                label="Availability"
                value={formData.availability}
                onChange={set('availability')}
                options={[
                  { value: 'immediate',    label: 'Immediate' },
                  { value: 'within_week',  label: 'Within a Week' },
                  { value: 'within_month', label: 'Within a Month' },
                  { value: 'not_available',label: 'Not Available' },
                ]}
              />
            </div>
          </Section>
        )}

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Complete Profile
        </Button>
      </form>
    </div>
  );
};

export default CompleteProfile;