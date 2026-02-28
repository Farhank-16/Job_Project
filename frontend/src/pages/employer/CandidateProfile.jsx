import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Award, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import { userService } from '../../services/userService';
import useAuth from '../../context/useAuth';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const CandidateProfile = () => {
  const { id }             = useParams();
  const navigate           = useNavigate();
  const { isSubscribed }   = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    userService.getProfile(id)
      .then(data => setProfile(data))
      .catch(() => { toast.error('Failed to load profile'); navigate(-1); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)   return <LoadingSpinner fullScreen />;
  if (!profile)  return null;

  const AVAIL_COLOR = {
    immediate:    { bg: '#f0fdf4', color: '#15803d' },
    within_week:  { bg: '#fffbeb', color: '#92400e' },
    within_month: { bg: '#fefce8', color: '#a16207' },
  };
  const avail = AVAIL_COLOR[profile.availability] || { bg: '#f1f5f9', color: '#475569' };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">

      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-display font-extrabold text-2xl"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
              {profile.name?.charAt(0).toUpperCase() || '?'}
            </div>
            {profile.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center ring-1 ring-white">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-extrabold text-slate-900 text-lg">{profile.name}</h1>
              {profile.exam_passed && <Award className="w-5 h-5 text-amber-500 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {[profile.area, profile.city].filter(Boolean).join(', ') || 'Location not set'}
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.is_verified && (
                <span className="badge badge-blue flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
              {profile.exam_passed && (
                <span className="badge badge-amber flex items-center gap-1">
                  <Award className="w-3 h-3" /> Certified
                </span>
              )}
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: avail.bg, color: avail.color }}>
                {profile.availability?.replace('_', ' ') || 'Not specified'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* About */}
        <div className="card-elevated p-4">
          <h3 className="font-display font-bold text-slate-800 text-sm mb-2">About</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            {profile.bio || 'No bio provided.'}
          </p>
        </div>

        {/* Details */}
        <div className="card-elevated p-4 divide-y divide-slate-50">
          <h3 className="font-display font-bold text-slate-800 text-sm pb-3">Details</h3>
          {[
            ['Experience', `${profile.experience_years || 0} years`],
            ['Expected Salary', profile.expected_salary_min || profile.expected_salary_max
              ? `₹${Number(profile.expected_salary_min || 0).toLocaleString('en-IN')} – ₹${Number(profile.expected_salary_max || 0).toLocaleString('en-IN')}`
              : 'Not specified'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-2.5">
              <span className="text-xs text-slate-400">{label}</span>
              <span className="font-semibold text-slate-800 text-sm">{value}</span>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="card-elevated p-4">
          <h3 className="font-display font-bold text-slate-800 text-sm mb-3">Skills</h3>
          {profile.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map(s => <span key={s.id} className="badge badge-blue">{s.name}</span>)}
            </div>
          ) : <p className="text-slate-400 text-xs">No skills listed</p>}
        </div>

        {/* Badges */}
        {(profile.is_verified || profile.exam_passed) && (
          <div className="card-elevated p-4">
            <h3 className="font-display font-bold text-slate-800 text-sm mb-3">Achievements</h3>
            <div className="space-y-2">
              {profile.is_verified && (
                <div className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: '#eff6ff' }}>
                  <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="font-display font-bold text-blue-900 text-xs">Verified Profile</p>
                    <p className="text-xs text-blue-500 mt-0.5">Identity verified by JobNest</p>
                  </div>
                </div>
              )}
              {profile.exam_passed && (
                <div className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: '#fffbeb' }}>
                  <Award className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-display font-bold text-amber-900 text-xs">Skill Certified</p>
                    <p className="text-xs text-amber-600 mt-0.5">Passed skill assessment exam</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-slate-100 p-4 safe-bottom">
        {profile.canContact && profile.mobile ? (
          <a href={`tel:${profile.mobile}`}
            className="btn-primary w-full py-4 text-base justify-between flex items-center px-5 rounded-[12px] no-underline">
            <span className="flex items-center gap-2"><Phone className="w-5 h-5" /> Call {profile.mobile}</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        ) : (
          <button onClick={() => navigate('/employer/subscription')}
            className="btn-primary w-full py-4 text-base justify-between" style={{ borderRadius: '12px' }}>
            <span className="flex items-center gap-2"><Lock className="w-5 h-5" /> Subscribe to Contact</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;