import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mail, Edit2, Crown, LogOut } from 'lucide-react';
import useAuth from '../../context/useAuth';
import { userService } from '../../services/userService';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const NameAvatar = ({ name }) => {
  const letter = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
      {letter}
    </div>
  );
};

const EmployerProfile = () => {
  const { user, logout, refreshUser, isSubscribed } = useAuth();
  const navigate = useNavigate();

  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading]             = useState(false);
  const [formData, setFormData] = useState({
    name:  '',
    email: '',
    bio:   '',
    area:  '',
    city:  '',
    state: '',
  });

  // Sync form when user data loads/refreshes
  useEffect(() => {
    if (user) {
      setFormData({
        name:  user.name  || '',
        email: user.email || '',
        bio:   user.bio   || '',
        area:  user.area  || '',
        city:  user.city  || '',
        state: user.state || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await userService.updateProfile(formData);
      await refreshUser();
      toast.success('Profile updated');
      setShowEditModal(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-6">
        <div className="flex items-center space-x-4">
          <NameAvatar name={user?.name} />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user?.name || 'Employer'}</h2>
            <p className="text-gray-500">+91 {user?.mobile}</p>
            <div className="mt-1">
              {isSubscribed ? <Badge variant="success">Premium</Badge> : <Badge>Free</Badge>}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-4 space-y-3">
        <button
          onClick={() => setShowEditModal(true)}
          className="card p-4 w-full flex items-center justify-between"
        >
          <div className="flex items-center">
            <Edit2 className="w-5 h-5 text-gray-400 mr-3" />
            <span className="font-medium">Edit Profile</span>
          </div>
          <span className="text-gray-400">→</span>
        </button>

        {!isSubscribed && (
          <button
            onClick={() => navigate('/employer/subscription')}
            className="card p-4 w-full flex items-center justify-between bg-purple-50 border-purple-200"
          >
            <div className="flex items-center">
              <Crown className="w-5 h-5 text-purple-600 mr-3" />
              <span className="font-medium text-purple-900">Upgrade to Premium</span>
            </div>
            <span className="text-purple-400">→</span>
          </button>
        )}
      </div>

      {/* Details */}
      <div className="px-4 py-4 space-y-4">
        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-2">About</h3>
          <p className="text-gray-600">{user?.bio || 'No description added yet.'}</p>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
              <span>{[user?.area, user?.city].filter(Boolean).join(', ') || 'Location not set'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" />
              <span>{user?.email || 'Email not set'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="card p-4 w-full flex items-center text-red-600"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Profile">
        <div className="space-y-4">
          <Input
            label="Company / Name"
            value={formData.name}
            onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(p => ({ ...p, bio: e.target.value }))}
              rows={3}
              className="input"
              placeholder="Tell candidates about your company..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Area"
              value={formData.area}
              onChange={(e) => setFormData(p => ({ ...p, area: e.target.value }))}
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))}
            />
          </div>
          <Input
            label="State"
            value={formData.state}
            onChange={(e) => setFormData(p => ({ ...p, state: e.target.value }))}
          />
          <Button fullWidth loading={loading} onClick={handleUpdateProfile}>
            Save Changes
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default EmployerProfile;