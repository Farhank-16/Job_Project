import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, X } from 'lucide-react';
import { jobService } from '../../services/jobService';
import { skillService } from '../../services/skillService';
import useAuth from '../../context/useAuth';
import  useDebounce  from '../../hooks/useDebounce';
import CandidateCard from '../../components/cards/CandidateCard';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const CandidateSearch = () => {
  const { isSubscribed } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [skills, setSkills] = useState([]);

  const [filters, setFilters] = useState({
    skillId: '',
    availability: '',
    radius: isSubscribed ? 50 : 10,
  });

  useEffect(() => {
    loadSkills();
    loadCandidates();
  }, [filters]);

  const loadSkills = async () => {
    try {
      const { skills } = await skillService.getSkills();
      setSkills(skills);
    } catch (error) {
      console.error('Failed to load skills:', error);
    }
  };

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const { candidates } = await jobService.searchCandidates(filters);
      setCandidates(candidates);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = (candidate) => {
    if (candidate.mobile) {
      window.location.href = `tel:${candidate.mobile}`;
    }
  };

  const clearFilters = () => {
    setFilters({
      skillId: '',
      availability: '',
      radius: isSubscribed ? 50 : 10,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-14 bg-white border-b z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Find Candidates</h2>
          <button
            onClick={() => setShowFilters(true)}
            className="p-2 rounded-lg border border-gray-300"
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Active Filters */}
        {(filters.skillId || filters.availability) && (
          <div className="flex items-center space-x-2 mt-3 overflow-x-auto no-scrollbar">
            {filters.skillId && (
              <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm whitespace-nowrap">
                {skills.find(s => s.id === parseInt(filters.skillId))?.name}
                <button onClick={() => setFilters(prev => ({ ...prev, skillId: '' }))}>
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
            {candidates.length} candidates found
            {!isSubscribed && ' (within 10 km)'}
          </p>
        )}

        {loading ? (
          <SkeletonList count={5} />
        ) : candidates.length > 0 ? (
          <div className="space-y-3">
            {candidates.map(candidate => (
              <CandidateCard 
                key={candidate.id} 
                candidate={candidate}
                onContact={handleContact}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No candidates found"
            description="Try adjusting your filters or search area"
            action={clearFilters}
            actionLabel="Clear Filters"
          />
        )}
      </div>

      {/* Filters Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Candidates"
      >
        <div className="space-y-4">
          <Select
            label="Skill"
            value={filters.skillId}
            onChange={(e) => setFilters(prev => ({ ...prev, skillId: e.target.value }))}
            options={skills.map(s => ({ value: s.id, label: s.name }))}
            placeholder="All Skills"
          />

          <Select
            label="Availability"
            value={filters.availability}
            onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
            options={[
              { value: 'immediate', label: 'Immediate' },
              { value: 'within_week', label: 'Within a week' },
              { value: 'within_month', label: 'Within a month' },
            ]}
            placeholder="Any"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distance: {filters.radius} km
              {!isSubscribed && ' (max 10 km)'}
            </label>
            <input
              type="range"
              min="1"
              max={isSubscribed ? 100 : 10}
              value={filters.radius}
              onChange={(e) => setFilters(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
              className="w-full"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button variant="secondary" fullWidth onClick={clearFilters}>
              Clear
            </Button>
            <Button fullWidth onClick={() => setShowFilters(false)}>
              Apply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CandidateSearch;