import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, Shield, Search, Phone, Award, Zap, Star, ArrowRight, BadgeCheck } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import useAuth from '../context/useAuth';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const SEEKER_FEATURES = [
  { icon: Search, text: 'Search jobs up to 100 km' },
  { icon: Phone,  text: 'Apply for unlimited jobs' },
  { icon: Zap,    text: 'Priority in search results' },
  { icon: Star,   text: 'Contact employers directly' },
  { icon: Award,  text: 'Take skill certification exams' },
];
const EMPLOYER_FEATURES = [
  { icon: Search, text: 'Search candidates up to 100 km' },
  { icon: Phone,  text: 'View candidate contact info' },
  { icon: Zap,    text: 'Post unlimited jobs' },
  { icon: Star,   text: 'Priority support' },
];

const PlanCard = ({ gradient, icon: Icon, title, price, sub, features, cta, loading, onClick, accentText }) => (
  <div className="card-elevated overflow-hidden">
    <div className="p-5 text-white" style={{ background: gradient }}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-display font-bold text-base">{title}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="font-display text-4xl font-black">{price}</span>
        <span className="text-white/70 text-sm mb-1">{sub}</span>
      </div>
      {accentText && <p className="text-white/60 text-xs mt-1">{accentText}</p>}
    </div>

    <div className="p-5">
      <ul className="space-y-2.5 mb-5">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
              <f.icon className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <span className="text-sm text-slate-600">{f.text}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onClick}
        disabled={loading}
        className="btn-primary w-full py-3.5 text-sm justify-between"
        style={{ borderRadius: '10px', background: gradient }}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          <><span>{cta}</span><ArrowRight className="w-4 h-4" /></>
        )}
      </button>
    </div>
  </div>
);

const Subscription = () => {
  const navigate = useNavigate();
  const { user, refreshUser, isSubscribed, isVerified } = useAuth();

  const [loading, setLoading]         = useState(true);
  const [subData, setSubData]         = useState(null);
  const [paying, setPaying]           = useState(false);
  const [payingBadge, setPayingBadge] = useState(false);
  const [payingExam, setPayingExam]   = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [userSkills, setUserSkills]   = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState(null);

  useEffect(() => {
    paymentService.getSubscriptionStatus()
      .then(setSubData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async () => {
    setPaying(true);
    try {
      const orderData = await paymentService.createSubscriptionOrder();
      const res = await paymentService.openRazorpay({
        key: orderData.key, amount: orderData.order.amount,
        currency: orderData.order.currency, name: 'JobNest',
        description: orderData.isFirstMonth ? 'Premium — First Month' : 'Premium Subscription',
        order_id: orderData.order.id, prefill: { contact: user?.mobile },
        theme: { color: '#7c3aed' },
      });
      await paymentService.verifyPayment({
        razorpay_order_id: orderData.order.id,
        razorpay_payment_id: res.razorpay_payment_id,
        razorpay_signature: res.razorpay_signature,
      });
      await refreshUser();
      toast.success('Subscription activated! 🎉');
      navigate(-1);
    } catch (error) {
      if (error.message !== 'Payment cancelled') toast.error('Payment failed. Please try again.');
    } finally { setPaying(false); }
  };

  const handleGetBadge = async () => {
    setPayingBadge(true);
    try {
      const orderData = await paymentService.createBadgeOrder();
      const res = await paymentService.openRazorpay({
        key: orderData.key, amount: orderData.order.amount,
        currency: orderData.order.currency, name: 'JobNest',
        description: 'Verified Badge — Instant Activation',
        order_id: orderData.order.id, prefill: { contact: user?.mobile },
        theme: { color: '#2563eb' },
      });
      await paymentService.verifyPayment({
        razorpay_order_id: orderData.order.id,
        razorpay_payment_id: res.razorpay_payment_id,
        razorpay_signature: res.razorpay_signature,
      });
      await refreshUser();
      toast.success('Profile verified! Blue tick activated ✓');
    } catch (error) {
      if (error.message !== 'Payment cancelled') toast.error('Payment failed. Please try again.');
    } finally { setPayingBadge(false); }
  };

  const handleExamClick = async () => {
    if (!isSubscribed) { toast.error('Subscribe first to take exams'); return; }
    if (!user?.skills?.length) {
      toast('Add skills to your profile first', { icon: '⚠️' });
      navigate('/seeker/profile');
      return;
    }
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
      const res = await paymentService.openRazorpay({
        key: orderData.key, amount: orderData.order.amount,
        currency: orderData.order.currency, name: 'JobNest',
        description: `Skill Exam: ${skillName}`,
        order_id: orderData.order.id, prefill: { contact: user?.mobile },
        theme: { color: '#d97706' },
      });
      await paymentService.verifyPayment({
        razorpay_order_id: orderData.order.id,
        razorpay_payment_id: res.razorpay_payment_id,
        razorpay_signature: res.razorpay_signature,
      });
      toast.success('Payment done! Starting exam...');
      navigate(`/seeker/exams/${selectedSkillId}`);
    } catch (error) {
      if (error.message !== 'Payment cancelled') toast.error('Payment failed. Please try again.');
      setShowExamModal(true);
    } finally { setPayingExam(false); }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const features = user?.role === 'job_seeker' ? SEEKER_FEATURES : EMPLOYER_FEATURES;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Active subscription banner */}
      {isSubscribed && (
        <div className="px-4 pt-5">
          <div className="rounded-2xl p-5 text-white flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)' }}>
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <p className="font-display font-extrabold text-base">Premium Active ✓</p>
              <p className="text-purple-200 text-xs mt-0.5">
                Expires:{' '}
                {subData?.endDate
                  ? new Date(subData.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-5 space-y-4">

        {/* Subscription Plan */}
        {!isSubscribed && (
          <PlanCard
            gradient="linear-gradient(135deg, #7c3aed, #6d28d9)"
            icon={Crown}
            title="Premium Plan"
            price="₹9"
            sub="first month"
            accentText="Then ₹99/month"
            features={features}
            cta="Subscribe Now — ₹9"
            loading={paying}
            onClick={handleSubscribe}
          />
        )}

        {/* Verified Badge */}
        {user?.role === 'job_seeker' && !isVerified && (
          <PlanCard
            gradient="linear-gradient(135deg, #2563eb, #1d4ed8)"
            icon={Shield}
            title="Verified Badge"
            price="₹99"
            sub="one-time"
            accentText="Instant activation — no waiting"
            features={[
              { icon: BadgeCheck, text: 'Blue tick ✓ on your profile' },
              { icon: Search,     text: 'Higher visibility in searches' },
              { icon: Shield,     text: 'Build trust with employers' },
              { icon: Zap,        text: 'Instant — no manual admin review' },
            ]}
            cta="Get Verified — ₹99"
            loading={payingBadge}
            onClick={handleGetBadge}
          />
        )}

        {/* Verified badge — already active */}
        {isVerified && (
          <div className="card-elevated p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <BadgeCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-display font-bold text-slate-900 text-sm">Verified Profile ✓</p>
              <p className="text-xs text-slate-500 mt-0.5">Your profile has the verified badge</p>
            </div>
          </div>
        )}

        {/* Skill Exam */}
        {user?.role === 'job_seeker' && !user?.examPassed && (
          <div className="card-elevated p-4" style={{ borderLeft: '4px solid #d97706' }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-display font-bold text-slate-900 text-sm">Skill Certification</p>
                <p className="text-xs text-slate-500 mt-0.5">Pass an exam to earn a skill badge</p>
                <p className="text-xs font-semibold text-amber-700 mt-1">₹49 per attempt</p>
              </div>
            </div>
            <button
              onClick={handleExamClick}
              disabled={payingExam}
              className="btn-secondary w-full py-2.5 text-sm"
              style={{ borderRadius: '10px' }}
            >
              {payingExam
                ? <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                : isSubscribed ? 'Pay ₹49 & Take Exam' : 'Subscribe First'
              }
            </button>
          </div>
        )}

        {/* Exam already passed */}
        {user?.role === 'job_seeker' && user?.examPassed && (
          <div className="card-elevated p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="font-display font-bold text-slate-900 text-sm">Skill Certified ✓</p>
              <p className="text-xs text-slate-500 mt-0.5">You have passed a skill certification</p>
            </div>
          </div>
        )}
      </div>

      {/* Skill Picker Modal */}
      <Modal isOpen={showExamModal} onClose={() => setShowExamModal(false)} title="Choose Skill Exam">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Select which skill exam you want to take:</p>
          <div className="space-y-2">
            {userSkills.map(skill => (
              <button key={skill.id} onClick={() => setSelectedSkillId(skill.id)}
                className="w-full p-3.5 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: selectedSkillId === skill.id ? '#d97706' : '#e2e8f0',
                  background:  selectedSkillId === skill.id ? '#fffbeb' : 'white',
                }}>
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold text-slate-800">{skill.name}</span>
                  {selectedSkillId === skill.id && <span className="text-amber-600">✓</span>}
                </div>
              </button>
            ))}
          </div>
          <div className="card p-3.5 space-y-1">
            {[['Questions','10 MCQ'],['Time','15 minutes'],['Pass Mark','60% (6/10)'],['Fee','₹49']].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-500">{k}</span>
                <span className="font-semibold text-slate-800">{v}</span>
              </div>
            ))}
          </div>
          <button onClick={handleExamPayment} disabled={!selectedSkillId}
            className="btn-primary w-full py-3.5 text-sm justify-between"
            style={{ borderRadius: '10px', background: 'linear-gradient(135deg, #d97706, #b45309)' }}>
            <span>Pay ₹49 & Start Exam</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Subscription;