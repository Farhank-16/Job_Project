import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Search, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const SelectRole = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();

  const mobile = sessionStorage.getItem('pendingMobile');
  const otp = sessionStorage.getItem('pendingOTP');

  const handleContinue = async () => {
    if (!selectedRole) {
      toast.error('Please select a role');
      return;
    }
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP(mobile, otp, name.trim(), selectedRole);
      
      sessionStorage.removeItem('pendingMobile');
      sessionStorage.removeItem('pendingOTP');
      sessionStorage.removeItem('isNewUser');
      
      toast.success('Account created successfully!');
      navigate('/complete-profile');
    } catch (error) {
      toast.error(error.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: 'job_seeker',
      title: 'I want to find work',
      description: 'Search for jobs and connect with employers',
      icon: Search,
    },
    {
      id: 'employer',
      title: 'I want to hire',
      description: 'Post jobs and find skilled workers',
      icon: Briefcase,
    },
  ];

  return (
    <div className="px-6 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600 mt-2">Tell us about yourself</p>
      </div>

      <div className="space-y-4 mb-6">
        <Input
          label="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          autoFocus
        />
      </div>

      <p className="text-sm font-medium text-gray-700 mb-3">How will you use JobNest?</p>
      
      <div className="space-y-3 mb-8">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          
          return (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`
                w-full p-4 rounded-xl border-2 text-left transition-all
                ${isSelected 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-start space-x-4">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                  ${isSelected ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-semibold ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                    {role.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Button
        onClick={handleContinue}
        fullWidth
        size="lg"
        loading={loading}
        disabled={!selectedRole || !name.trim()}
        icon={ArrowRight}
        iconPosition="right"
      >
        Continue
      </Button>
    </div>
  );
};

export default SelectRole;