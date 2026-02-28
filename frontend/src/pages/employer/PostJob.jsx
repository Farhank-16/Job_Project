import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, CheckCircle2, ArrowRight } from 'lucide-react';
import { jobService } from '../../services/jobService';
import { skillService } from '../../services/skillService';
import useAuth from '../../context/useAuth';
import { useLocation as useGeoLocation } from '../../hooks/useLocation';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
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

const PostJob = () => {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const { getCurrentLocation, loading: locLoading } = useGeoLocation();

  const [loading, setLoading] = useState(false);
  const [skills, setSkills]   = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', skillId: '',
    jobType: 'full_time', salaryMin: '', salaryMax: '', salaryType: 'monthly',
    area: user?.area || '', city: user?.city || '', state: user?.state || '',
    latitude: user?.latitude || null, longitude: user?.longitude || null,
    radiusKm: 10, vacancies: 1, availabilityRequired: 'flexible',
    experienceRequired: 0, jobDuration: '',
  });

  useEffect(() => {
    skillService.getSkills().then(({ skills }) => setSkills(skills)).catch(console.error);
  }, []);

  const set  = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const setN = k => e => setForm(p => ({ ...p, [k]: parseInt(e.target.value) || 0 }));

  const handleGetLocation = async () => {
    try {
      const coords = await getCurrentLocation();
      setForm(p => ({ ...p, latitude: coords.latitude, longitude: coords.longitude }));
      toast.success('Location captured!');
    } catch (err) { toast.error(err.message); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Please enter job title');
    if (!form.latitude || !form.longitude) return toast.error('Please capture job location');
    setLoading(true);
    try {
      await jobService.createJob(form);
      toast.success('Job posted successfully!');
      navigate('/employer/jobs');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to post job'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-4">

        <Section title=" Job Details">
          <Input label="Job Title *" value={form.title} onChange={set('title')} placeholder="e.g., Software Developer" />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Description</label>
            <textarea value={form.description} onChange={set('description')} rows={4} className="input"
              placeholder="Describe responsibilities, requirements..." />
          </div>
          <Select label="Required Skill" value={form.skillId} onChange={set('skillId')}
            options={skills.map(s => ({ value: s.id, label: s.name }))} placeholder="Select a skill" />
          <Select label="Job Type" value={form.jobType} onChange={set('jobType')}
            options={[
              { value: 'full_time',  label: 'Full Time' },
              { value: 'part_time',  label: 'Part Time' },
              { value: 'contract',   label: 'Contract' },
              { value: 'daily_wage', label: 'Daily Wage' },
            ]} />
          <Select label="Job Duration" value={form.jobDuration} onChange={set('jobDuration')}
            placeholder="Select duration" options={DURATION_OPTIONS} />
        </Section>

        <Section title=" Salary">
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" label="Minimum (₹)" value={form.salaryMin} onChange={set('salaryMin')} placeholder="10000" />
            <Input type="number" label="Maximum (₹)" value={form.salaryMax} onChange={set('salaryMax')} placeholder="15000" />
          </div>
          <Select label="Salary Type" value={form.salaryType} onChange={set('salaryType')}
            options={[
              { value: 'hourly',  label: 'Per Hour' },
              { value: 'daily',   label: 'Per Day' },
              { value: 'weekly',  label: 'Per Week' },
              { value: 'monthly', label: 'Per Month' },
            ]} />
        </Section>

        <Section title="Job Location">
          <button type="button" onClick={handleGetLocation} disabled={locLoading}
            className={`w-full py-3 rounded-xl border-2 font-display font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              form.latitude
                ? 'border-green-400 bg-green-50 text-green-700'
                : 'border-slate-200 bg-white text-slate-600'
            }`}>
            {form.latitude
              ? <><CheckCircle2 className="w-4 h-4" /> Location Captured</>
              : locLoading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />Getting location...</span>
                : <><Navigation className="w-4 h-4" /> Capture Job Location</>
            }
          </button>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Area/Village" value={form.area}  onChange={set('area')}  placeholder="Enter area" />
            <Input label="City/Town *"  value={form.city}  onChange={set('city')}  placeholder="Enter city" />
          </div>
          <Input label="State" value={form.state} onChange={set('state')} placeholder="Enter state" />
        </Section>

        <Section title="Requirements">
          <div className="grid grid-cols-2 gap-3">
            <Input type="number" label="Vacancies"          value={form.vacancies}           onChange={e => setForm(p => ({ ...p, vacancies: parseInt(e.target.value) || 1 }))} min={1} />
            <Input type="number" label="Experience (years)" value={form.experienceRequired}  onChange={setN('experienceRequired')} min={0} />
          </div>
          <Select label="Candidate Availability" value={form.availabilityRequired} onChange={set('availabilityRequired')}
            options={[
              { value: 'immediate',    label: 'Immediately' },
              { value: 'within_week',  label: 'Within a week' },
              { value: 'within_month', label: 'Within a month' },
              { value: 'flexible',     label: 'Flexible' },
            ]} />
        </Section>

        <button type="submit" disabled={loading}
          className="btn-primary w-full py-4 text-base justify-between" style={{ borderRadius: '12px' }}>
          {loading
            ? <span className="flex items-center gap-2 justify-center w-full">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Posting Job...
              </span>
            : <><span>Post Job</span><ArrowRight className="w-5 h-5" /></>
          }
        </button>
      </form>
    </div>
  );
};

export default PostJob;