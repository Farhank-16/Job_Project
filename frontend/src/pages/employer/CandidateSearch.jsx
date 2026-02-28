import React, { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { jobService } from '../../services/jobService';
import { skillService } from '../../services/skillService';
import useAuth from '../../context/useAuth';
import CandidateCard from '../../components/cards/CandidateCard';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonList } from '../../components/ui/Skeleton';

const CandidateSearch = () => {
  const { isSubscribed } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [skills, setSkills]         = useState([]);
  const [filters, setFilters]       = useState({ skillId: '', availability: '', radius: isSubscribed ? 50 : 10 });

  useEffect(() => {
    skillService.getSkills().then(({ skills }) => setSkills(skills)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    jobService.searchCandidates(filters)
      .then(({ candidates }) => setCandidates(candidates))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  const setF  = k => v => setFilters(p => ({ ...p, [k]: v }));
  const clear = () => setFilters({ skillId: '', availability: '', radius: isSubscribed ? 50 : 10 });

  const chips = [
    filters.skillId      && { key: 'skillId',      label: skills.find(s => s.id === parseInt(filters.skillId))?.name },
    filters.availability && { key: 'availability', label: filters.availability.replace('_', ' ') },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Filter bar */}
      <div className="sticky top-14 bg-white border-b border-slate-100 z-30 px-4 py-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <p className="font-display font-bold text-slate-800 text-sm">Find Candidates</p>
          <button onClick={() => setShowFilters(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border-2 transition-colors"
            style={{
              borderColor: chips.length ? '#2563eb' : '#e2e8f0',
              background:  chips.length ? '#eff6ff' : 'white',
              color:       chips.length ? '#2563eb' : '#64748b',
            }}>
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {chips.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {chips.map(chip => (
              <span key={chip.key}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold whitespace-nowrap capitalize">
                {chip.label}
                <button onClick={() => setF(chip.key)('')}><X className="w-3 h-3" /></button>
              </span>
            ))}
            <button onClick={clear} className="text-xs text-slate-400 whitespace-nowrap">Clear all</button>
          </div>
        )}
      </div>

      <div className="px-4 py-4 pb-20">
        {!loading && (
          <p className="text-xs text-slate-500 font-medium mb-3">
            {candidates.length} candidates{!isSubscribed && ' · within 10 km'}
          </p>
        )}

        {loading ? <SkeletonList count={5} /> : candidates.length > 0 ? (
          <div className="space-y-3">
            {candidates.map(c => (
              <CandidateCard key={c.id} candidate={c}
                onContact={c => { if (c.mobile) window.location.href = `tel:${c.mobile}`; }} />
            ))}
          </div>
        ) : (
          <EmptyState title="No candidates found"
            description="Try adjusting your filters or search area"
            action={clear} actionLabel="Clear Filters" />
        )}
      </div>

      <Modal isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filter Candidates">
        <div className="space-y-4">
          <Select label="Skill" value={filters.skillId} onChange={e => setF('skillId')(e.target.value)}
            options={skills.map(s => ({ value: s.id, label: s.name }))} placeholder="All Skills" />
          <Select label="Availability" value={filters.availability} onChange={e => setF('availability')(e.target.value)}
            options={[
              { value: 'immediate',    label: 'Immediate' },
              { value: 'within_week',  label: 'Within a week' },
              { value: 'within_month', label: 'Within a month' },
            ]} placeholder="Any" />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Distance: {filters.radius} km
              {!isSubscribed && <span className="text-slate-400 font-normal"> (max 10 km free)</span>}
            </label>
            <input type="range" min="1" max={isSubscribed ? 100 : 10} value={filters.radius}
              onChange={e => setF('radius')(parseInt(e.target.value))}
              className="w-full accent-blue-600" />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1 km</span><span>{isSubscribed ? '100 km' : '10 km'}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={clear}
              className="btn-secondary flex-1 py-3 text-sm" style={{ borderRadius: '10px' }}>Clear</button>
            <button onClick={() => setShowFilters(false)}
              className="btn-primary flex-1 py-3 text-sm" style={{ borderRadius: '10px' }}>Apply</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CandidateSearch;