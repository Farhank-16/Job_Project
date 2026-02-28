import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, X } from 'lucide-react';
import { jobService } from '../../services/jobService';
import { skillService } from '../../services/skillService';
import useAuth from '../../context/useAuth';
import useDebounce from '../../hooks/useDebounce';
import JobCard from '../../components/cards/JobCard';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';

const JobSearch = () => {
  const { isSubscribed } = useAuth();

  const [jobs, setJobs]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [skills, setSkills]       = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [filters, setFilters] = useState({
    search: '', skillId: '', city: '', jobType: '',
    radius: isSubscribed ? 50 : 10,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => {
    skillService.getSkills().then(({ skills }) => setSkills(skills)).catch(console.error);
  }, []);

  useEffect(() => { loadJobs(); },
    [debouncedSearch, filters.skillId, filters.city, filters.jobType, filters.radius, pagination.page]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await jobService.getJobs({ ...filters, search: debouncedSearch, page: pagination.page, limit: 10 });
      setJobs(res.jobs);
      setPagination(res.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const setF = key => e => {
    setPagination(p => ({ ...p, page: 1 }));
    setFilters(p => ({ ...p, [key]: e.target.value }));
  };

  const clearFilters = () => {
    setPagination(p => ({ ...p, page: 1 }));
    setFilters({ search: '', skillId: '', city: '', jobType: '', radius: isSubscribed ? 50 : 10 });
  };

  const activeChips = [
    filters.skillId && { key: 'skillId', label: skills.find(s => s.id === parseInt(filters.skillId))?.name },
    filters.city    && { key: 'city',    label: filters.city },
    filters.jobType && { key: 'jobType', label: filters.jobType.replace('_', ' ') },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Search + filter bar */}
      <div className="sticky top-14 bg-white border-b border-slate-100 z-30 px-4 py-3 space-y-2.5">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={filters.search} onChange={setF('search')} placeholder="Search jobs..."
              className="input pl-9 py-2.5 text-sm w-full" style={{ borderRadius: '10px' }} />
          </div>
          <button onClick={() => setShowFilters(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-colors flex-shrink-0"
            style={{
              borderColor: activeChips.length ? '#2563eb' : '#e2e8f0',
              background:  activeChips.length ? '#eff6ff' : 'white',
              color:       activeChips.length ? '#2563eb' : '#64748b',
            }}>
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {activeChips.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {activeChips.map(chip => (
              <span key={chip.key}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold whitespace-nowrap">
                {chip.label}
                <button onClick={() => setF(chip.key)({ target: { value: '' } })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button onClick={clearFilters} className="text-xs text-slate-400 whitespace-nowrap">Clear all</button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-4 py-4 pb-20">
        {!loading && (
          <p className="text-xs text-slate-500 font-medium mb-3">
            {pagination.total} jobs found{!isSubscribed && ' · within 10 km'}
          </p>
        )}

        {loading ? <SkeletonList count={5} /> : jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        ) : (
          <EmptyState title="No jobs found"
            description="Try adjusting your filters or search terms"
            action={clearFilters} actionLabel="Clear Filters" />
        )}

        {!loading && pagination.page < pagination.pages && (
          <button
            onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            className="w-full mt-4 py-3.5 text-center text-blue-600 font-display font-semibold text-sm">
            Load More
          </button>
        )}
      </div>

      {/* Filters Modal */}
      <Modal isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filter Jobs">
        <div className="space-y-4">
          <Select label="Skill" value={filters.skillId} onChange={setF('skillId')}
            options={skills.map(s => ({ value: s.id, label: s.name }))} placeholder="All Skills" />
          <Input label="City" value={filters.city} onChange={setF('city')}
            placeholder="Enter city name" icon={MapPin} />
          <Select label="Job Type" value={filters.jobType} onChange={setF('jobType')}
            options={[
              { value: 'full_time',  label: 'Full Time' },
              { value: 'part_time',  label: 'Part Time' },
              { value: 'contract',   label: 'Contract' },
              { value: 'daily_wage', label: 'Daily Wage' },
            ]} placeholder="All Types" />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Distance: {filters.radius} km
              {!isSubscribed && <span className="text-slate-400 font-normal"> (max 10 km free)</span>}
            </label>
            <input type="range" min="1" max={isSubscribed ? 100 : 10}
              value={filters.radius}
              onChange={e => setFilters(p => ({ ...p, radius: parseInt(e.target.value) }))}
              className="w-full accent-blue-600" />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1 km</span><span>{isSubscribed ? '100 km' : '10 km'}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={clearFilters}
              className="btn-secondary flex-1 py-3 text-sm" style={{ borderRadius: '10px' }}>
              Clear
            </button>
            <button onClick={() => setShowFilters(false)}
              className="btn-primary flex-1 py-3 text-sm" style={{ borderRadius: '10px' }}>
              Apply Filters
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobSearch;