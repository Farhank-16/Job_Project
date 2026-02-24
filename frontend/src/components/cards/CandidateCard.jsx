import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Award, CheckCircle2, Star } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const CandidateCard = ({ candidate, onContact }) => {
  const navigate = useNavigate();

  return (
    <div className="card p-4">
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="relative">
          {candidate.profile_photo ? (
            <img 
              src={candidate.profile_photo} 
              alt={candidate.name}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xl font-medium text-gray-600">
                {candidate.name?.charAt(0) || '?'}
              </span>
            </div>
          )}
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
            <MapPin className="w-4 h-4 mr-1" />
            <span className="truncate">
              {candidate.area && `${candidate.area}, `}{candidate.city}
            </span>
            {candidate.distance && (
              <span className="ml-2">• {candidate.distance.toFixed(1)} km</span>
            )}
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="primary" size="xs">
              {candidate.experience_years || 0} yrs exp
            </Badge>
            {candidate.availability && (
              <Badge variant="success" size="xs">
                {candidate.availability.replace('_', ' ')}
              </Badge>
            )}
          </div>

          {candidate.skills && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-1">
              Skills: {candidate.skills}
            </p>
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
          <Button
            size="sm"
            fullWidth
            onClick={() => onContact?.(candidate)}
          >
            Contact
          </Button>
        ) : (
          <Button
            size="sm"
            fullWidth
            onClick={() => navigate('/employer/subscription')}
          >
            Unlock
          </Button>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;