import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Search, ArrowRight } from 'lucide-react';
import useAuth from '../../context/useAuth';
import toast from 'react-hot-toast';

const roles = [
  { id: 'job_seeker', icon: Search,   emoji: '🔍',
    title: 'I\'m looking for work',
    desc:  'Browse jobs and connect with employers',
    color: '#2563eb' },
  { id: 'employer',   icon: Briefcase, emoji: '🏢',
    title: 'I\'m hiring',
    desc:  'Post jobs and find skilled candidates',
    color: '#7c3aed' },
];

const SelectRole = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [name, setName]                 = useState('');
  const [loading, setLoading]           = useState(false);
  const { verifyOTP }                   = useAuth();
  const navigate                        = useNavigate();

  const mobile = sessionStorage.getItem('pendingMobile');
  const otp    = sessionStorage.getItem('pendingOTP');

  const handleContinue = async () => {
    if (!name.trim())  { toast.error('Please enter your name'); return; }
    if (!selectedRole) { toast.error('Please select a role');   return; }
    setLoading(true);
    try {
      await verifyOTP(mobile, otp, name.trim(), selectedRole);
      ['pendingMobile','pendingOTP','isNewUser'].forEach(k => sessionStorage.removeItem(k));
      toast.success('Account created!');
      navigate('/complete-profile');
    } catch (error) {
      toast.error(error.error || 'Failed to create account');
    } finally { setLoading(false); }
  };

  return (
    <div className="px-6 py-8 page-enter">
      <div className="mb-7">
        <h2 className="font-display text-2xl font-bold text-slate-900">Create Account</h2>
        <p className="text-slate-500 text-sm mt-1">Tell us a bit about yourself</p>
      </div>

      {/* Name */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
        <input
          className="input text-base font-semibold"
          style={{ borderRadius: '12px', padding: '14px 16px' }}
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      </div>

      <p className="text-sm font-semibold text-slate-700 mb-3">How will you use JobNest?</p>

      <div className="space-y-3 mb-8">
        {roles.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <button key={role.id} onClick={() => setSelectedRole(role.id)}
              className="w-full p-4 rounded-2xl border-2 text-left transition-all"
              style={{
                borderColor: isSelected ? role.color : '#e2e8f0',
                background:  isSelected ? `${role.color}08` : 'white',
                boxShadow:   isSelected ? `0 0 0 4px ${role.color}18` : 'none',
              }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: isSelected ? `${role.color}15` : '#f8fafc' }}>
                  {role.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-slate-800">{role.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{role.desc}</p>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                    style={{ background: role.color }}>✓</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button onClick={handleContinue}
        disabled={!selectedRole || !name.trim() || loading}
        className="btn-primary w-full py-4 text-base justify-between"
        style={{ borderRadius: '12px' }}>
        <span>Continue</span>
        {loading
          ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <ArrowRight className="w-5 h-5" />}
      </button>
    </div>
  );
};

export default SelectRole;