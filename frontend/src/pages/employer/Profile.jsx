import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, MapPin, Phone, Mail, Edit2, 
  Camera, Crown, LogOut, Building2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const EmployerProfile = () => {
  const { user, logout, refreshUser, isSubscribed } = useAuth();
  const navigate = useNavigate();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    area: user?.area || '',
    city: user?.city || '',
    state: user?.state || '',
  });

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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await userService.uploadPhoto(file);
      await refreshUser();
      toast.success('Photo updated');
    } catch (error) {
      toast.error('Failed to upload photo');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {user?.profilePhoto ? (
              <img 
                src={user.profilePhoto} 
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-primary-600" />
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer">
              <Camera className="w-4 h-4 text-white" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
          
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">+91 {user?.mobile}</p>
            <div className="flex items-center mt-1">
              {isSubscribed ? (
                <Badge variant="success">Premium</Badge>
              ) : (
                <Badge>Free</Badge>
              )}
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
          <h3 className="font-semibold text-gray-900 mb-3">About</h3>
          <p className="text-gray-600">
            {user?.bio || 'No description added yet.'}
          </p>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-3 text-gray-400" />
              {user?.area && `${user.area}, `}{user?.city || 'Location not set'}
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-3 text-gray-400" />
              {user?.email || 'Email not set'}
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
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
      >
        <div className="space-y-4">
          <Input
            label="Company/Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="input"
              placeholder="Tell candidates about your company..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Area"
              value={formData.area}
              onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            />
          </div>
          <Input
            label="State"
            value={formData.state}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
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