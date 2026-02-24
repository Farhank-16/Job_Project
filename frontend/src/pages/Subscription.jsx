import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, Check, Star, Shield, Search, 
  Phone, Award, Zap, ArrowRight 
} from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const Subscription = () => {
  const navigate = useNavigate();
  const { user, refreshUser, isSubscribed, isVerified } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payingBadge, setPayingBadge] = useState(false);

  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const data = await paymentService.getSubscriptionStatus();
      setSubscriptionData(data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setPaying(true);
    try {
      const orderData = await paymentService.createSubscriptionOrder();

      const paymentResponse = await paymentService.openRazorpay({
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'RuralJobs',
        description: orderData.isFirstMonth ? 'Premium Subscription (First Month)' : 'Premium Subscription',
        order_id: orderData.order.id,
        prefill: {
          contact: user?.mobile,
        },
        theme: {
          color: '#16a34a',
        },
      });

      await paymentService.verifyPayment({
        razorpay_order_id: orderData.order.id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      await refreshUser();
      toast.success('Subscription activated!');
      navigate(-1);
    } catch (error) {
      if (error.message !== 'Payment cancelled') {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setPaying(false);
    }
  };

  const handleGetBadge = async () => {
    setPayingBadge(true);
    try {
      const orderData = await paymentService.createBadgeOrder();

      const paymentResponse = await paymentService.openRazorpay({
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'RuralJobs',
        description: 'Verified Badge',
        order_id: orderData.order.id,
        prefill: {
          contact: user?.mobile,
        },
        theme: {
          color: '#16a34a',
        },
      });

      await paymentService.verifyPayment({
        razorpay_order_id: orderData.order.id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
      });

      await refreshUser();
      toast.success('Verified badge activated!');
    } catch (error) {
      if (error.message !== 'Payment cancelled') {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setPayingBadge(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const features = user?.role === 'job_seeker' ? [
    { icon: Search, text: 'Search jobs up to 100 km' },
    { icon: Phone, text: 'Apply for unlimited jobs' },
    { icon: Zap, text: 'Get priority in search' },
    { icon: Star, text: 'Contact employers directly' },
  ] : [
    { icon: Search, text: 'Search candidates up to 100 km' },
    { icon: Phone, text: 'View candidate contact info' },
    { icon: Zap, text: 'Post unlimited jobs' },
    { icon: Star, text: 'Priority support' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Current Status */}
      {isSubscribed && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Premium Active</h2>
              <p className="text-primary-100 text-sm">
                Expires: {new Date(subscriptionData?.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-6 space-y-6">
        {/* Subscription Card */}
        {!isSubscribed && (
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-6 h-6" />
                <span className="font-bold text-lg">Premium Plan</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">₹9</span>
                <span className="text-purple-200 ml-2">first month</span>
              </div>
              <p className="text-purple-200 text-sm mt-1">
                Then ₹99/month
              </p>
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">What you get:</h3>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                      <feature.icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-gray-700">{feature.text}</span>
                  </li>
                ))}
              </ul>

              <Button
                fullWidth
                size="lg"
                className="mt-6"
                loading={paying}
                onClick={handleSubscribe}
                icon={ArrowRight}
                iconPosition="right"
              >
                Subscribe Now - ₹9
              </Button>
            </div>
          </div>
        )}

        {/* Verified Badge Card */}
        {!isVerified && user?.role === 'job_seeker' && (
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-6 h-6" />
                <span className="font-bold text-lg">Verified Badge</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold">₹99</span>
                <span className="text-blue-200 ml-2">one-time</span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Benefits:</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="text-gray-700">Blue tick on your profile</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="text-gray-700">Higher visibility in searches</span>
                </li>
                <li className="flex items-center">
                  <Check className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="text-gray-700">Build trust with employers</span>
                </li>
              </ul>

              <Button
                variant="secondary"
                fullWidth
                size="lg"
                className="mt-6"
                loading={payingBadge}
                onClick={handleGetBadge}
              >
                Get Verified - ₹99
              </Button>
            </div>
          </div>
        )}

        {/* Already Verified */}
        {isVerified && (
          <div className="card p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-blue-900">Verified Profile</h3>
                <p className="text-sm text-blue-700">Your profile has the verified badge</p>
              </div>
            </div>
          </div>
        )}

        {/* Skill Exam Promo */}
        {user?.role === 'job_seeker' && !user?.examPassed && (
          <div className="card p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Award className="w-6 h-6 text-yellow-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-yellow-900">Skill Certification</h3>
                  <p className="text-sm text-yellow-700">Pass an exam to showcase your skills</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate(user.role === 'job_seeker' ? '/seeker/exams' : '/employer/exams')}
              >
                ₹49
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;