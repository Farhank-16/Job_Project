import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, CheckCircle2, Star, ArrowRight, Lock } from 'lucide-react';
import { examService } from '../services/examService';
import { paymentService } from '../services/paymentService';
import useAuth from '../context/useAuth';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ExamCard = ({ exam, isSubscribed, onTake, highlight = false }) => (
  <div className={`card-elevated p-4 transition-all ${
    highlight ? 'border-l-4 border-l-amber-400' : ''
  }`}>
    <div className="flex items-start gap-3">
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: exam.passed ? '#f0fdf4' : highlight ? '#fffbeb' : '#f1f5f9',
        }}>
        <Award className="w-5 h-5"
          style={{ color: exam.passed ? '#16a34a' : highlight ? '#d97706' : '#94a3b8' }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-display font-bold text-slate-900 text-sm">{exam.name}</h3>
          {highlight && !exam.passed && (
            <span className="badge badge-amber">Your skill</span>
          )}
          {exam.passed && (
            <span className="badge badge-green flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Passed
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{exam.category}</p>
        <p className="text-xs text-slate-400 mt-0.5">{exam.question_count} questions · 15 mins · ₹49</p>
      </div>
    </div>

    {!exam.passed && (
      <button
        onClick={() => onTake(exam)}
        className={`mt-3 w-full py-2.5 text-sm font-display font-bold rounded-xl transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 ${
          isSubscribed
            ? highlight
              ? 'btn-primary'
              : 'btn-secondary'
            : 'btn-secondary opacity-70'
        }`}
      >
        {isSubscribed ? (
          <><Award className="w-4 h-4" /> Take Exam</>
        ) : (
          <><Lock className="w-4 h-4" /> Subscribe to Take Exam</>
        )}
      </button>
    )}
  </div>
);

const ExamList = () => {
  const navigate              = useNavigate();
  const { user, isSubscribed } = useAuth();

  const [exams, setExams]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [paying, setPaying]         = useState(false);

  useEffect(() => {
    examService.getAvailableExams()
      .then(({ exams }) => setExams(exams))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleTakeExam = (exam) => {
    if (!isSubscribed) {
      toast.error('Subscription required to take exams');
      navigate('/seeker/subscription');
      return;
    }
    setSelectedExam(exam);
  };

  const handlePayAndStart = async (exam) => {
    setPaying(true);
    try {
      const orderData = await paymentService.createExamOrder(exam.id);
      const response  = await paymentService.openRazorpay({
        key:         orderData.key,
        amount:      orderData.order.amount,
        currency:    orderData.order.currency,
        name:        'JobNest',
        description: `Skill Exam: ${exam.name}`,
        order_id:    orderData.order.id,
        prefill:     { contact: user?.mobile },
        theme:       { color: '#2563eb' },
      });
      await paymentService.verifyPayment({
        razorpay_order_id:   orderData.order.id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature:  response.razorpay_signature,
      });
      toast.success('Payment done! Starting exam...');
      setSelectedExam(null);
      navigate(`/seeker/exams/${exam.id}`);
    } catch (error) {
      if (error.message !== 'Payment cancelled')
        toast.error('Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  const myExams    = exams.filter(e => e.isMySkill);
  const otherExams = exams.filter(e => !e.isMySkill);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Header */}
      <div className="px-4 py-5 space-y-4">

        {/* Banner */}
        <div className="rounded-2xl p-5 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white opacity-10 -translate-y-8 translate-x-8" />
          <Award className="w-8 h-8 text-amber-100 mb-2" />
          <h1 className="font-display text-xl font-extrabold">Skill Certifications</h1>
          <p className="text-amber-100 text-sm mt-1">
            Pass exams, earn badges, stand out to employers
          </p>
        </div>

        {/* Subscription notice */}
        {!isSubscribed && (
          <div className="card p-4 flex items-center justify-between gap-3"
            style={{ borderLeft: '4px solid #7c3aed' }}>
            <div>
              <p className="font-display font-bold text-slate-800 text-sm">Subscription Required</p>
              <p className="text-xs text-slate-500 mt-0.5">Upgrade to access all skill exams</p>
            </div>
            <button
              onClick={() => navigate('/seeker/subscription')}
              className="flex items-center gap-1 text-purple-600 font-semibold text-sm flex-shrink-0"
            >
              Upgrade <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Benefits strip */}
        <div className="card p-4" style={{ borderLeft: '4px solid #d97706' }}>
          <p className="font-display font-bold text-slate-800 text-sm mb-2">Benefits of Certification</p>
          <div className="grid grid-cols-1 gap-1.5">
            {[
              'Priority in search results',
              'Skill badge on your profile',
              'Higher chances of getting hired',
            ].map(b => (
              <div key={b} className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Skill Exams */}
      {myExams.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-500" />
            <h2 className="font-display font-bold text-slate-800 text-sm">Your Skills</h2>
          </div>
          <div className="space-y-3">
            {myExams.map(exam => (
              <ExamCard key={exam.id} exam={exam} isSubscribed={isSubscribed} onTake={handleTakeExam} highlight />
            ))}
          </div>
        </div>
      )}

      {/* Other Exams */}
      {otherExams.length > 0 && (
        <div className="px-4 pb-4">
          <h2 className="font-display font-bold text-slate-800 text-sm mb-3">
            {myExams.length > 0 ? 'Other Exams' : 'Available Exams'}
          </h2>
          <div className="space-y-3">
            {otherExams.map(exam => (
              <ExamCard key={exam.id} exam={exam} isSubscribed={isSubscribed} onTake={handleTakeExam} />
            ))}
          </div>
        </div>
      )}

      {exams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-display font-bold text-slate-700">No exams available</p>
          <p className="text-slate-500 text-sm mt-1">Check back later</p>
        </div>
      )}

      {/* Exam details Modal */}
      <Modal isOpen={!!selectedExam} onClose={() => setSelectedExam(null)}
        title={`${selectedExam?.name} Exam`}>
        {selectedExam && (
          <div className="space-y-4">
            <div className="card p-4 space-y-2">
              {[
                ['Questions', '10 Multiple Choice'],
                ['Time Limit', '15 minutes'],
                ['Pass Mark',  '60% (6/10 correct)'],
                ['Fee',        '₹49 per attempt'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-800">{value}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl text-xs text-amber-700"
              style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
              Each attempt requires a new payment if you don't pass.
            </div>

            <button
              onClick={() => handlePayAndStart(selectedExam)}
              disabled={paying}
              className="btn-primary w-full py-4 text-base justify-between"
              style={{ borderRadius: '12px' }}
            >
              {paying ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                <><span>Pay ₹49 & Start Exam</span><ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExamList;