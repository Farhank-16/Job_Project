import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { skillService } from '../../services/skillService';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skillId: '',
    jobType: 'full_time',
    salaryMin: '',
    salaryMax: '',
    salaryType: 'monthly',
    area: '',
    city: '',
    state: '',
    vacancies: 1,
    availabilityRequired: 'flexible',
    experienceRequired: 0,
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [jobData, skillsData] = await Promise.all([
        jobService.getJob(id),
        skillService.getSkills(),
      ]);
      
      setSkills(skillsData.skills);
      setFormData({
        title: jobData.title || '',
        description: jobData.description || '',
        skillId: jobData.skill_id || '',
        jobType: jobData.job_type || 'full_time',
        salaryMin: jobData.salary_min || '',
        salaryMax: jobData.salary_max || '',
        salaryType: jobData.salary_type || 'monthly',
        area: jobData.area || '',
        city: jobData.city || '',
        state: jobData.state || '',
        vacancies: jobData.vacancies || 1,
        availabilityRequired: jobData.availability_required || 'flexible',
        experienceRequired: jobData.experience_required || 0,
        isActive: jobData.is_active,
      });
    } catch (error) {
      toast.error('Failed to load job');
      navigate('/employer/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSaving(true);
    try {
      await jobService.updateJob(id, formData);
      toast.success('Job updated successfully');
      navigate('/employer/jobs');
    } catch (error) {
      toast.error('Failed to update job');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        <div className="card p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Job Details</h3>
          
          <Input
            label="Job Title *"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="input"
            />
          </div>

          <Select
            label="Required Skill"
            value={formData.skillId}
            onChange={(e) => setFormData(prev => ({ ...prev, skillId: e.target.value }))}
            options={skills.map(s => ({ value: s.id, label: s.name }))}
          />

          <Select
            label="Job Type"
            value={formData.jobType}
            onChange={(e) => setFormData(prev => ({ ...prev, jobType: e.target.value }))}
            options={[
              { value: 'full_time', label: 'Full Time' },
              { value: 'part_time', label: 'Part Time' },
              { value: 'contract', label: 'Contract' },
              { value: 'daily_wage', label: 'Daily Wage' },
            ]}
          />

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Job Active</span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                formData.isActive ? 'bg-primary-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                formData.isActive ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        <div className="card p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Salary</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Minimum (₹)"
              value={formData.salaryMin}
              onChange={(e) => setFormData(prev => ({ ...prev, salaryMin: e.target.value }))}
            />
            <Input
              type="number"
              label="Maximum (₹)"
              value={formData.salaryMax}
              onChange={(e) => setFormData(prev => ({ ...prev, salaryMax: e.target.value }))}
            />
          </div>

          <Select
            label="Salary Type"
            value={formData.salaryType}
            onChange={(e) => setFormData(prev => ({ ...prev, salaryType: e.target.value }))}
            options={[
              { value: 'hourly', label: 'Per Hour' },
              { value: 'daily', label: 'Per Day' },
              { value: 'weekly', label: 'Per Week' },
              { value: 'monthly', label: 'Per Month' },
            ]}
          />
        </div>

        <div className="card p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Location</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Area"
              value={formData.area}
              onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            />
          </div>
          <Input
            label="State"
            value={formData.state}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
          />
        </div>

        <div className="card p-4 space-y-4">
          <h3 className="font-semibold text-gray-900">Requirements</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Vacancies"
              value={formData.vacancies}
              onChange={(e) => setFormData(prev => ({ ...prev, vacancies: parseInt(e.target.value) || 1 }))}
              min={1}
            />
            <Input
              type="number"
              label="Experience (years)"
              value={formData.experienceRequired}
              onChange={(e) => setFormData(prev => ({ ...prev, experienceRequired: parseInt(e.target.value) || 0 }))}
              min={0}
            />
          </div>

          <Select
            label="Availability Required"
            value={formData.availabilityRequired}
            onChange={(e) => setFormData(prev => ({ ...prev, availabilityRequired: e.target.value }))}
            options={[
              { value: 'immediate', label: 'Immediately' },
              { value: 'within_week', label: 'Within a week' },
              { value: 'within_month', label: 'Within a month' },
              { value: 'flexible', label: 'Flexible' },
            ]}
          />
        </div>

        <div className="flex space-x-3">
          <Button variant="secondary" fullWidth onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={saving}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;