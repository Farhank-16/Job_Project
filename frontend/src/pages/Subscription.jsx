import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, Check, Shield, Search, 
  Phone, Award, Zap, Star, ArrowRight 
} from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { examService } from '../services/examService';
import { skillService } from '../services/skillService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const Subscription = () => {
  const navigate = useNavigate();
  const { user, refreshUser, isSubscribed, isVerified } = useAuth();

  const [loading, setLoading]               = useState(true);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [paying, setPaying]                 = useState(false);
  const [payingBadge, setPayingBadge]       = useState(false);
  const [payingExam, setPayingExam]         = useState(false);

  // Exam skill picker modal
  const [showExamModal, setShowExamModal]   = useState(false);
  const [userSkills, setUserSkills]         = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await paymentService.getSubscriptionStatus();
      setSubscriptionData(data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── Subscription ────────────────────────────────────────────────
  const handleSubscribe = async () => {
    setPaying(true);
    try {
      const orderData = await paymentService.createSubscriptionOrder();
      const paymentResponse = await paymentService.openRazorpay({
        key:         orderData.key,
        amount:      orderData.order.amount,
        currency:    orderData.order.currency,
        name:        'JobNest',
        description: orderData.isFirstMonth ? 'Premium Subscription (First Month)' : 'Premium Subscription',
        order_id:    orderData.order.id,
        prefill:     { contact: user?.mobile },
        theme:       { color: '#16a34a' },
      });
      await paymentService.verifyPayment({
        razorpay_order_id:   orderData.order.id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature:  paymentResponse.razorpay_signature,
      });
      await refreshUser();
      toast.success('Subscription activated! 🎉');
      navigate(-1);
    } catch (error) {
      if (error.message !== 'Payment cancelled') {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setPaying(false);
    }
  };

  // ─── Verified Badge — auto-verified on payment ───────────────────
  const handleGetBadge = async () => {
    setPayingBadge(true);
    try {
      const orderData = await paymentService.createBadgeOrder();
      const paymentResponse = await paymentService.openRazorpay({
        key:         orderData.key,
        amount:      orderData.order.amount,
        currency:    orderData.order.currency,
        name:        'JobNest',
        description: 'Verified Badge — Instant Activation',
        order_id:    orderData.order.id,
        prefill:     { contact: user?.mobile },
        theme:       { color: '#2563eb' },
      });
      // verifyPayment backend mein processBadgePayment call karta hai
      // jo is_verified = TRUE set karta hai — no manual admin step needed
      await paymentService.verifyPayment({
        razorpay_order_id:   orderData.order.id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature:  paymentResponse.razorpay_signature,
      });
      await refreshUser(); // user.isVerified ab true hoga
      toast.success('Profile verified! Blue tick activated ✓');
    } catch (error) {
      if (error.message !== 'Payment cancelled') {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setPayingBadge(false);
    }
  };

  // ─── Skill Exam — FIX: open skill picker, then pay ───────────────
  const handleExamClick = async () => {
    if (!isSubscribed) {
      toast.error('Subscribe first to take skill exams');
      return;
    }
    if (!user?.skills?.length) {
      toast('Add skills to your profile first', { icon: '⚠️' });
      navigate('/seeker/profile');
      return;
    }
    // Show modal to pick which skill exam to pay for
    setUserSkills(user.skills);
    setSelectedSkillId(user.skills[0]?.id || null);
    setShowExamModal(true);
  };

  const handleExamPayment = async () => {
    if (!selectedSkillId) return;
    setPayingExam(true);
    setShowExamModal(false);
    try {
      const orderData = await paymentService.createExamOrder({ skillId: selectedSkillId });
      const skillName = userSkills.find(s => s.id === selectedSkillId)?.name || 'Skill';
      const paymentResponse = await paymentService.openRazorpay({
        key:         orderData.key,
        amount:      orderData.order.amount,
        currency:    orderData.order.currency,
        name:        'JobNest',
        description: `Skill Exam: ${skillName}`,
        order_id:    orderData.order.id,
        prefill:     { contact: user?.mobile },
        theme:       { color: '#d97706' },
      });
      await paymentService.verifyPayment({
        razorpay_order_id:   orderData.order.id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature:  paymentResponse.razorpay_signature,
      });
      toast.success('Payment done! Starting exam...');
      // Navigate to the exam for this specific skill
      navigate(`/seeker/exams/${selectedSkillId}`);
    } catch (error) {
      if (error.message !== 'Payment cancelled') {
        toast.error('Payment failed. Please try again.');
      }
      setShowExamModal(true); // reopen on failure
    } finally {
      setPayingExam(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const seekerFeatures = [
    { icon: Search, text: 'Search jobs up to 100 km' },
    { icon: Phone,  text: 'Apply for unlimited jobs' },
    { icon: Zap,    text: 'Priority in search results' },
    { icon: Star,   text: 'Contact employers directly' },
    { icon: Award,  text: 'Take skill certification exams' },
  ];
  const employerFeatures = [
    { icon: Search, text: 'Search candidates up to 100 km' },
    { icon: Phone,  text: 'View candidate contact info' },
    { icon: Zap,    text: 'Post unlimited jobs' },
    { icon: Star,   text: 'Priority support' },
  ];
  const features = user?.role === 'job_seeker' ? seekerFeatures : employerFeatures;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* Active subscription banner */}
      {isSubscribed && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Premium Active ✓</h2>
              <p className="text-primary-100 text-sm">
                Expires: {subscriptionData?.endDate
                  ? new Date(subscriptionData.endDate).toLocaleDateString('en-IN')
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-6 space-y-6">

        {/* ── Subscription Card ── */}
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
              <p className="text-purple-200 text-sm mt-1">Then ₹99/month</p>
            </div>
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">What you get:</h3>
              <ul className="space-y-3">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <f.icon className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-gray-700">{f.text}</span>
                  </li>
                ))}
              </ul>
              <Button
                fullWidth size="lg" className="mt-6"
                loading={paying}
                onClick={handleSubscribe}
                icon={ArrowRight} iconPosition="right"
              >
                Subscribe Now — ₹9
              </Button>
            </div>
          </div>
        )}

        {/* ── Verified Badge Card ── */}
        {user?.role === 'job_seeker' && !isVerified && (
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
              <p className="text-blue-200 text-sm mt-1">Instant activation — no waiting</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3 mb-6">
                {[
                  'Blue tick ✓ on your profile',
                  'Higher visibility in searches',
                  'Build trust with employers',
                  'Instant — no manual admin review',
                ].map((t, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{t}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="secondary" fullWidth size="lg"
                loading={payingBadge}
                onClick={handleGetBadge}
              >
                Get Verified — ₹99
              </Button>
            </div>
          </div>
        )}

        {/* Already verified */}
        {isVerified && (
          <div className="card p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h3 className="font-semibold text-blue-900">Verified Profile ✓</h3>
                <p className="text-sm text-blue-700">Your profile has the verified badge</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Skill Exam Card — FIX: actually starts payment ── */}
        {user?.role === 'job_seeker' && !user?.examPassed && (
          <div className="card p-5 bg-yellow-50 border-yellow-200">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">Skill Certification</h3>
                <p className="text-sm text-yellow-700 mt-0.5">
                  Pass an exam to get a skill badge on your profile
                </p>
                <p className="text-sm font-semibold text-yellow-800 mt-1">₹49 per attempt</p>
              </div>
            </div>
            <Button
              fullWidth size="sm" className="mt-4"
              variant="secondary"
              loading={payingExam}
              onClick={handleExamClick}
            >
              {isSubscribed ? 'Pay & Take Exam' : 'Subscribe First'}
            </Button>
          </div>
        )}

        {user?.role === 'job_seeker' && user?.examPassed && (
          <div className="card p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center">
              <Award className="w-6 h-6 text-yellow-600 mr-3" />
              <div>
                <h3 className="font-semibold text-yellow-900">Skill Certified ✓</h3>
                <p className="text-sm text-yellow-700">You have passed a skill certification</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Skill Picker Modal ── */}
      <Modal
        isOpen={showExamModal}
        onClose={() => setShowExamModal(false)}
        title="Choose Skill Exam"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select which skill you want to take the exam for:
          </p>
          <div className="space-y-2">
            {userSkills.map(skill => (
              <button
                key={skill.id}
                onClick={() => setSelectedSkillId(skill.id)}
                className={`w-full p-3 rounded-xl border-2 text-left transition-colors ${
                  selectedSkillId === skill.id
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="font-medium text-gray-900">{skill.name}</span>
              </button>
            ))}
          </div>
          <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
            <p>• 10 questions • 15 min time limit</p>
            <p>• Pass mark: 60% (6/10)</p>
            <p>• Fee: ₹49 per attempt</p>
          </div>
          <Button
            fullWidth
            onClick={handleExamPayment}
            disabled={!selectedSkillId}
          >
            Pay ₹49 & Start Exam →
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default Subscription;