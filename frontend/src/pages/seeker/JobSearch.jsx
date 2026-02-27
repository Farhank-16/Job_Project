import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, X } from 'lucide-react';
import { jobService } from '../../services/jobService';
import { skillService } from '../../services/skillService';
import useAuth from '../../context/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import JobCard from '../../components/cards/JobCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';

const JobSearch = () => {
  const { isSubscribed } = useAuth();

  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [skills, setSkills]         = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const [filters, setFilters] = useState({
    search:  '',
    skillId: '',
    city:    '',
    jobType: '',
    radius:  isSubscribed ? 50 : 10,
  });

  const debouncedSearch = useDebounce(filters.search, 500);

  useEffect(() => { loadSkills(); }, []);

  useEffect(() => {
    loadJobs();
  }, [debouncedSearch, filters.skillId, filters.city, filters.jobType, filters.radius, pagination.page]);

  const loadSkills = async () => {
    try {
      const { skills } = await skillService.getSkills();
      setSkills(skills);
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await jobService.getJobs({
        ...filters,
        search: debouncedSearch,
        page:   pagination.page,
        limit:  10,
      });
      setJobs(response.jobs);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const setFilter = (key) => (e) => {
    setPagination(prev => ({ ...prev, page: 1 })); // reset page on filter change
    setFilters(prev => ({ ...prev, [key]: e.target.value }));
  };

  const clearFilters = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setFilters({ search: '', skillId: '', city: '', jobType: '', radius: isSubscribed ? 50 : 10 });
  };

  const hasActiveFilters = filters.skillId || filters.city || filters.jobType;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="sticky top-14 bg-white border-b z-30 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={setFilter('search')}
              placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(true)}
            className={`p-2.5 rounded-lg border ${
              hasActiveFilters
                ? 'bg-primary-50 border-primary-500 text-primary-600'
                : 'border-gray-300 text-gray-600'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center space-x-2 mt-3 overflow-x-auto no-scrollbar">
            {filters.skillId && (
              <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm whitespace-nowrap">
                {skills.find(s => s.id === parseInt(filters.skillId))?.name}
                <button onClick={() => setFilter('skillId')({ target: { value: '' } })}>
                  <X className="w-4 h-4 ml-1" />
                </button>
              </span>
            )}
            {filters.city && (
              <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm whitespace-nowrap">
                {filters.city}
                <button onClick={() => setFilter('city')({ target: { value: '' } })}>
                  <X className="w-4 h-4 ml-1" />
                </button>
              </span>
            )}
            <button onClick={clearFilters} className="text-sm text-gray-500 whitespace-nowrap">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="px-4 py-4">
        {!loading && (
          <p className="text-sm text-gray-500 mb-4">
            {pagination.total} jobs found
            {!isSubscribed && ' (within 10 km)'}
          </p>
        )}

        {loading ? (
          <SkeletonList count={5} />
        ) : jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map(job => <JobCard key={job.id} job={job} />)}
          </div>
        ) : (
          <EmptyState
            title="No jobs found"
            description="Try adjusting your filters or search terms"
            action={clearFilters}
            actionLabel="Clear Filters"
          />
        )}

        {!loading && pagination.page < pagination.pages && (
          <div className="mt-4">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            >
              Load More
            </Button>
          </div>
        )}
      </div>

      {/* Filters Modal */}
      <Modal isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filter Jobs">
        <div className="space-y-4">
          <Select
            label="Skill"
            value={filters.skillId}
            onChange={setFilter('skillId')}
            options={skills.map(s => ({ value: s.id, label: s.name }))}
            placeholder="All Skills"
          />
          <Input
            label="City"
            value={filters.city}
            onChange={setFilter('city')}
            placeholder="Enter city name"
            icon={MapPin}
          />
          <Select
            label="Job Type"
            value={filters.jobType}
            onChange={setFilter('jobType')}
            options={[
              { value: 'full_time',  label: 'Full Time' },
              { value: 'part_time',  label: 'Part Time' },
              { value: 'contract',   label: 'Contract' },
              { value: 'daily_wage', label: 'Daily Wage' },
            ]}
            placeholder="All Types"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distance: {filters.radius} km
              {!isSubscribed && ' (max 10 km for free users)'}
            </label>
            <input
              type="range"
              min="1"
              max={isSubscribed ? 100 : 10}
              value={filters.radius}
              onChange={(e) => setFilters(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 km</span>
              <span>{isSubscribed ? '100 km' : '10 km'}</span>
            </div>
          </div>
          <div className="flex space-x-3 pt-4">
            <Button variant="secondary" fullWidth onClick={clearFilters}>Clear</Button>
            <Button fullWidth onClick={() => setShowFilters(false)}>Apply</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JobSearch;