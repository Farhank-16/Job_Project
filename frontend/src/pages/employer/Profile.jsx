import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mail, Edit2, Crown, LogOut, ChevronRight } from 'lucide-react';
import useAuth from '../../context/useAuth';
import { userService } from '../../services/userService';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const EmployerProfile = () => {
  const { user, logout, refreshUser, isSubscribed } = useAuth();
  const navigate = useNavigate();
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [form, setForm]         = useState({ name: '', email: '', bio: '', area: '', city: '', state: '' });

  useEffect(() => {
    if (user) setForm({
      name: user.name || '', email: user.email || '', bio: user.bio || '',
      area: user.area || '', city: user.city || '', state: user.state || '',
    });
  }, [user]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      await userService.updateProfile(form);
      await refreshUser();
      toast.success('Profile updated');
      setShowEdit(false);
    } catch { toast.error('Failed to update profile'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-display font-extrabold text-2xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
            {user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-extrabold text-slate-900 text-lg truncate">{user?.name || 'Employer'}</h2>
            <p className="text-slate-400 text-sm">+91 {user?.mobile}</p>
            <span className={`badge mt-1.5 ${isSubscribed ? 'badge-green' : 'badge-gray'}`}>
              {isSubscribed ? '⭐ Premium' : 'Free Account'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Edit */}
        <button onClick={() => setShowEdit(true)}
          className="card-elevated p-4 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center">
              <Edit2 className="w-4 h-4 text-slate-400" />
            </div>
            <span className="font-display font-bold text-slate-800 text-sm">Edit Profile</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
        </button>

        {/* Premium upsell */}
        {!isSubscribed && (
          <button onClick={() => navigate('/employer/subscription')}
            className="card-elevated p-4 w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                <Crown className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-display font-bold text-purple-700 text-sm">Upgrade to Premium</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
        )}

        {/* About */}
        <div className="card-elevated p-4">
          <h3 className="font-display font-bold text-slate-800 text-sm mb-2">About</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            {user?.bio || 'No description added yet. Tap Edit Profile to add one.'}
          </p>
        </div>

        {/* Contact */}
        <div className="card-elevated p-4 space-y-3">
          <h3 className="font-display font-bold text-slate-800 text-sm">Contact Details</h3>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <MapPin className="w-4 h-4 text-slate-300 flex-shrink-0" />
            {[user?.area, user?.city].filter(Boolean).join(', ') || 'Location not set'}
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Mail className="w-4 h-4 text-slate-300 flex-shrink-0" />
            {user?.email || 'Email not set'}
          </div>
        </div>

        {/* Logout */}
        <button onClick={logout}
          className="card-elevated p-4 w-full flex items-center gap-3 text-red-500">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <LogOut className="w-4 h-4" />
          </div>
          <span className="font-display font-bold text-sm">Logout</span>
        </button>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Profile">
        <div className="space-y-4">
          <Input label="Company / Name" value={form.name}  onChange={set('name')} />
          <Input label="Email" type="email" value={form.email} onChange={set('email')} />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>About</label>
            <textarea value={form.bio} onChange={set('bio')} rows={3} className="input"
              placeholder="Tell candidates about your company..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Area"  value={form.area}  onChange={set('area')} />
            <Input label="City"  value={form.city}  onChange={set('city')} />
          </div>
          <Input label="State" value={form.state} onChange={set('state')} />
          <button onClick={handleSave} disabled={loading}
            className="btn-primary w-full py-3.5 text-sm" style={{ borderRadius: '10px' }}>
            {loading
              ? <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              : 'Save Changes'
            }
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EmployerProfile;