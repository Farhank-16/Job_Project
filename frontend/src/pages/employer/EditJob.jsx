import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { skillService } from '../../services/skillService';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const DURATION_OPTIONS = [
  { value: '1 day',         label: '1 Day' },
  { value: '1 week',        label: '1 Week' },
  { value: '2 weeks',       label: '2 Weeks' },
  { value: '1 month',       label: '1 Month' },
  { value: '3 months',      label: '3 Months' },
  { value: '6 months',      label: '6 Months' },
  { value: '1 year',        label: '1 Year' },
  { value: 'Permanent',     label: 'Permanent' },
  { value: 'Project based', label: 'Project Based' },
];

const Section = ({ title, children }) => (
  <div className="card-elevated p-4 space-y-4">
    <h3 className="font-display font-bold text-slate-800 text-sm">{title}</h3>
    {children}
  </div>
);

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [skills, setSkills]   = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', skillId: '', jobType: 'full_time',
    salaryMin: '', salaryMax: '', salaryType: 'monthly',
    area: '', city: '', state: '', vacancies: 1,
    availabilityRequired: 'flexible', experienceRequired: 0,
    jobDuration: '', isActive: true,
  });

  useEffect(() => {
    Promise.all([jobService.getJob(id), skillService.getSkills()])
      .then(([job, { skills }]) => {
        setSkills(skills);
        setForm({
          title: job.title || '', description: job.description || '',
          skillId: job.skill_id || '', jobType: job.job_type || 'full_time',
          salaryMin: job.salary_min || '', salaryMax: job.salary_max || '',
          salaryType: job.salary_type || 'monthly',
          area: job.area || '', city: job.city || '', state: job.state || '',
          vacancies: job.vacancies || 1,
          availabilityRequired: job.availability_required || 'flexible',
          experienceRequired: job.experience_required || 0,
          jobDuration: job.job_duration || '', isActive: job.is_active,
        });
      })
      .catch(() => { toast.error('Failed to load job'); navigate('/employer/jobs'); })
      .finally(() => setLoading(false));
  }, [id]);

  const set  = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await jobService.updateJob(id, form);
      toast.success('Job updated!');
      navigate('/employer/jobs');
    } catch { toast.error('Failed to update job'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-4">

        <Section title=" Job Details">
          <Input label="Job Title *" value={form.title} onChange={set('title')} />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Description</label>
            <textarea value={form.description} onChange={set('description')} rows={4} className="input" />
          </div>
          <Select label="Required Skill" value={form.skillId} onChange={set('skillId')}
            options={skills.map(s => ({ value: s.id, label: s.name }))} placeholder="Select skill" />
          <Select label="Job Type" value={form.jobType} onChange={set('jobType')}
            options={[
              { value: 'full_time',  label: 'Full Time' },
              { value: 'part_time',  label: 'Part Time' },
              { value: 'contract',   label: 'Contract' },
              { value: 'daily_wage', label: 'Daily Wage' },
            ]} />
          <Select label="Job Duration" value={form.jobDuration} onChange={set('jobDuration')}
            placeholder="Select duration" options={DURATION_OPTIONS} />

          {/* Active toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
            <div>
              <p className="font-display font-bold text-slate-800 text-sm">Job Active</p>
              <p className="text-xs text-slate-400 mt-0.5">{form.isActive ? 'Visible to candidates' : 'Hidden from search'}</p>
            </div>
            <button type="button"
              onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
              className="w-12 h-6 rounded-full transition-colors flex-shrink-0"
              style={{ background: form.isActive ? '#2563eb' : '#e2e8f0' }}>
              <div className="w-5 h-5 bg-white rounded-full shadow transition-transform"
                style={{ transform: form.isActive ? 'translateX(26px)' : 'translateX(2px)' }} />
            </button>
          </div>
        </Section>

        <Section title=" Salary">
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" label="Minimum (₹)" value={form.salaryMin} onChange={set('salaryMin')} />
            <Input type="number" label="Maximum (₹)" value={form.salaryMax} onChange={set('salaryMax')} />
          </div>
          <Select label="Salary Type" value={form.salaryType} onChange={set('salaryType')}
            options={[
              { value: 'hourly',  label: 'Per Hour' },
              { value: 'daily',   label: 'Per Day' },
              { value: 'weekly',  label: 'Per Week' },
              { value: 'monthly', label: 'Per Month' },
            ]} />
        </Section>

        <Section title=" Location">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Area"  value={form.area}  onChange={set('area')} />
            <Input label="City"  value={form.city}  onChange={set('city')} />
          </div>
          <Input label="State" value={form.state} onChange={set('state')} />
        </Section>

        <Section title=" Requirements">
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" label="Vacancies"          value={form.vacancies}          onChange={e => setForm(p => ({ ...p, vacancies: parseInt(e.target.value) || 1 }))} min={1} />
            <Input type="number" label="Experience (years)" value={form.experienceRequired} onChange={e => setForm(p => ({ ...p, experienceRequired: parseInt(e.target.value) || 0 }))} min={0} />
          </div>
          <Select label="Availability Required" value={form.availabilityRequired} onChange={set('availabilityRequired')}
            options={[
              { value: 'immediate',    label: 'Immediately' },
              { value: 'within_week',  label: 'Within a week' },
              { value: 'within_month', label: 'Within a month' },
              { value: 'flexible',     label: 'Flexible' },
            ]} />
        </Section>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="btn-secondary flex-1 py-3.5 text-sm" style={{ borderRadius: '12px' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="btn-primary flex-1 py-3.5 text-sm" style={{ borderRadius: '12px' }}>
            {saving
              ? <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              : 'Save Changes'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;