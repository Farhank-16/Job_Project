import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const type = searchParams.get('type') || 'payment';

  useEffect(() => {
    refreshUser();
  }, []);

  const getMessage = () => {
    switch (type) {
      case 'subscription':
        return {
          title: 'Subscription Activated!',
          description: 'You can now apply for jobs and access all premium features.',
        };
      case 'exam':
        return {
          title: 'Payment Successful!',
          description: 'You can now take the skill exam.',
        };
      case 'badge':
        return {
          title: 'Verified Badge Activated!',
          description: 'Your profile now displays the verified badge.',
        };
      default:
        return {
          title: 'Payment Successful!',
          description: 'Your payment has been processed successfully.',
        };
    }
  };

  const { title, description } = getMessage();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 text-center">{title}</h1>
      <p className="text-gray-600 text-center mt-2 mb-8">{description}</p>

      <Button
        fullWidth
        onClick={() => navigate(user?.role === 'employer' ? '/employer' : '/seeker')}
        icon={Home}
      >
        Go to Dashboard
      </Button>
    </div>
  );
};

export default PaymentSuccess;