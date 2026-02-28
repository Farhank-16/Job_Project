import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Award, BadgeCheck, Phone } from 'lucide-react';

const AVAIL = {
  immediate:    'Available Now',
  within_week:  'Within a Week',
  within_month: 'Within a Month',
  not_available:'Not Available',
};

const Avatar = ({ name }) => (
  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-display font-bold text-lg flex-shrink-0"
    style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
    {name?.charAt(0).toUpperCase() || '?'}
  </div>
);

const CandidateCard = ({ candidate, onContact }) => {
  const navigate = useNavigate();
  const skills = (() => {
    if (!candidate.skills) return [];
    if (Array.isArray(candidate.skills)) return candidate.skills;
    return candidate.skills.split(',').map(s => s.trim()).filter(Boolean);
  })();

  return (
    <div className="card-elevated p-4">
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar name={candidate.name} />
          {candidate.is_verified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-white">
              <BadgeCheck className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-display font-bold text-slate-900 text-sm truncate">{candidate.name}</h3>
            {candidate.exam_passed && <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">
              {[candidate.area, candidate.city].filter(Boolean).join(', ')}
              {candidate.distance != null && ` · ${Number(candidate.distance).toFixed(1)} km`}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="badge badge-gray">{candidate.experience_years || 0} yrs exp</span>
            {candidate.availability && (
              <span className={`badge ${candidate.availability === 'immediate' ? 'badge-green' : 'badge-amber'}`}>
                {AVAIL[candidate.availability] || candidate.availability}
              </span>
            )}
          </div>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {skills.slice(0, 4).map((s, i) => <span key={i} className="badge badge-blue">{s}</span>)}
          {skills.length > 4 && <span className="badge badge-gray">+{skills.length - 4} more</span>}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button onClick={() => navigate(`/employer/candidates/${candidate.id}`)}
          className="btn-secondary flex-1 py-2.5 text-sm" style={{ borderRadius: '10px' }}>
          View Profile
        </button>
        {candidate.canContact ? (
          <button onClick={() => onContact?.(candidate)}
            className="btn-primary flex-1 py-2.5 text-sm gap-1.5" style={{ borderRadius: '10px' }}>
            <Phone className="w-4 h-4" /> Contact
          </button>
        ) : (
          <button onClick={() => navigate('/employer/subscription')}
            className="flex-1 py-2.5 text-sm font-display font-bold rounded-[10px]"
            style={{ background: '#fef3c7', color: '#92400e' }}>
            🔒 Unlock
          </button>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;