import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from 'lucide-react';
import { jobService } from '../../services/jobService';
import { skillService } from '../../services/skillService';
import useAuth from '../../context/useAuth';
import { useLocation as useGeoLocation } from '../../hooks/useLocation';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCurrentLocation, loading: locationLoading } = useGeoLocation();

  const [loading, setLoading] = useState(false);
  const [skills, setSkills]   = useState([]);
  const [formData, setFormData] = useState({
    title:                '',
    description:          '',
    skillId:              '',
    jobType:              'full_time',
    salaryMin:            '',
    salaryMax:            '',
    salaryType:           'monthly',
    area:                 user?.area      || '',
    city:                 user?.city      || '',
    state:                user?.state     || '',
    latitude:             user?.latitude  || null,
    longitude:            user?.longitude || null,
    radiusKm:             10,
    vacancies:            1,
    availabilityRequired: 'flexible',
    experienceRequired:   0,
    jobDuration:          '',      // ← added
  });

  useEffect(() => { loadSkills(); }, []);

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
      setFormData(prev => ({ ...prev, latitude: coords.latitude, longitude: coords.longitude }));
      toast.success('Location captured!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const set = (key) => (e) => setFormData(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Please enter job title');
    if (!formData.latitude || !formData.longitude) return toast.error('Please capture job location');

    setLoading(true);
    try {
      await jobService.createJob(formData);
      toast.success('Job posted successfully!');
      navigate('/employer/jobs');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">

        {/* Basic Info */}
        <div className="card p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Job Details</h3>

          <Input
            label="Job Title *"
            value={formData.title}
            onChange={set('title')}
            placeholder="e.g., Tractor Driver, Farm Worker"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={set('description')}
              rows={4}
              className="input"
              placeholder="Describe the job responsibilities, requirements, etc."
            />
          </div>

          <Select
            label="Required Skill"
            value={formData.skillId}
            onChange={set('skillId')}
            options={skills.map(s => ({ value: s.id, label: s.name }))}
            placeholder="Select a skill"
          />

          <Select
            label="Job Type"
            value={formData.jobType}
            onChange={set('jobType')}
            options={[
              { value: 'full_time',   label: 'Full Time' },
              { value: 'part_time',   label: 'Part Time' },
              { value: 'contract',    label: 'Contract' },
              { value: 'daily_wage',  label: 'Daily Wage' },
            ]}
          />

          {/* Job Duration — added */}
          <Select
            label="Job Duration"
            value={formData.jobDuration}
            onChange={set('jobDuration')}
            placeholder="Select duration"
            options={[
              { value: '1 day',        label: '1 Day' },
              { value: '1 week',       label: '1 Week' },
              { value: '2 weeks',      label: '2 Weeks' },
              { value: '1 month',      label: '1 Month' },
              { value: '3 months',     label: '3 Months' },
              { value: '6 months',     label: '6 Months' },
              { value: '1 year',       label: '1 Year' },
              { value: 'Permanent',    label: 'Permanent' },
              { value: 'Project based',label: 'Project Based' },
            ]}
          />
        </div>

        {/* Salary */}
        <div className="card p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Salary</h3>

          <div className="grid grid-cols-2 gap-4">
            <Input type="number" label="Minimum (₹)" value={formData.salaryMin} onChange={set('salaryMin')} placeholder="e.g., 10000" />
            <Input type="number" label="Maximum (₹)" value={formData.salaryMax} onChange={set('salaryMax')} placeholder="e.g., 15000" />
          </div>

          <Select
            label="Salary Type"
            value={formData.salaryType}
            onChange={set('salaryType')}
            options={[
              { value: 'hourly',  label: 'Per Hour' },
              { value: 'daily',   label: 'Per Day' },
              { value: 'weekly',  label: 'Per Week' },
              { value: 'monthly', label: 'Per Month' },
            ]}
          />
        </div>

        {/* Location */}
        <div className="card p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Job Location</h3>

          <Button type="button" variant="secondary" fullWidth onClick={handleGetLocation} loading={locationLoading} icon={Navigation}>
            {formData.latitude ? 'Location Captured ✓' : 'Capture Job Location'}
          </Button>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Area/Village" value={formData.area}  onChange={set('area')}  placeholder="Enter area" />
            <Input label="City/Town *"  value={formData.city}  onChange={set('city')}  placeholder="Enter city" />
          </div>
          <Input label="State" value={formData.state} onChange={set('state')} placeholder="Enter state" />
        </div>

        {/* Requirements */}
        <div className="card p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Requirements</h3>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number" label="Vacancies"
              value={formData.vacancies}
              onChange={(e) => setFormData(prev => ({ ...prev, vacancies: parseInt(e.target.value) || 1 }))}
              min={1}
            />
            <Input
              type="number" label="Experience (years)"
              value={formData.experienceRequired}
              onChange={(e) => setFormData(prev => ({ ...prev, experienceRequired: parseInt(e.target.value) || 0 }))}
              min={0}
            />
          </div>

          <Select
            label="When should candidate be available?"
            value={formData.availabilityRequired}
            onChange={set('availabilityRequired')}
            options={[
              { value: 'immediate',     label: 'Immediately' },
              { value: 'within_week',   label: 'Within a week' },
              { value: 'within_month',  label: 'Within a month' },
              { value: 'flexible',      label: 'Flexible' },
            ]}
          />
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading}>
          Post Job
        </Button>
      </form>
    </div>
  );
};

export default PostJob;