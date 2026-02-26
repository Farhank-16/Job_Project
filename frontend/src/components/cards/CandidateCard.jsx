import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Award, CheckCircle2 } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

// Naam ka pehla letter
const NameAvatar = ({ name }) => {
  const letter = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div className="relative">
      <div className="w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
        {letter}
      </div>
      {/* Verified badge overlay */}
    </div>
  );
};

const CandidateCard = ({ candidate, onContact }) => {
  const navigate = useNavigate();

  // Multiple skills — backend GROUP_CONCAT se comma-separated string aata hai
  const skillList = (() => {
    if (!candidate.skills) return [];
    if (Array.isArray(candidate.skills)) return candidate.skills;
    return candidate.skills.split(',').map(s => s.trim()).filter(Boolean);
  })();

  return (
    <div className="card p-4">
      <div className="flex items-start space-x-3">
        {/* Avatar with verified indicator */}
        <div className="relative flex-shrink-0">
          <NameAvatar name={candidate.name} />
          {candidate.is_verified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900 truncate">{candidate.name}</h3>
            {candidate.exam_passed && (
              <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            )}
          </div>

          <div className="flex items-center text-sm text-gray-500 mt-1">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">
              {[candidate.area, candidate.city].filter(Boolean).join(', ')}
            </span>
            {candidate.distance != null && (
              <span className="ml-2 flex-shrink-0">• {Number(candidate.distance).toFixed(1)} km</span>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-1 mt-2">
            <Badge variant="primary" size="xs">
              {candidate.experience_years || 0} yrs exp
            </Badge>
            {candidate.availability && (
              <Badge variant="success" size="xs">
                {candidate.availability.replace('_', ' ')}
              </Badge>
            )}
          </div>

          {/* Multiple skills */}
          {skillList.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {skillList.map((skill, i) => (
                <Badge key={i} variant="secondary" size="xs">{skill}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 mt-4">
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          onClick={() => navigate(`/employer/candidates/${candidate.id}`)}
        >
          View Profile
        </Button>
        {candidate.canContact ? (
          <Button size="sm" fullWidth onClick={() => onContact?.(candidate)}>
            Contact
          </Button>
        ) : (
          <Button size="sm" fullWidth onClick={() => navigate('/employer/subscription')}>
            Unlock
          </Button>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;