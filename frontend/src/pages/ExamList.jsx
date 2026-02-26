import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, CheckCircle, ArrowRight, Star } from 'lucide-react';
import { examService } from '../services/examService';
import { paymentService } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ExamList = () => {
  const navigate = useNavigate();
  const { user, isSubscribed } = useAuth();

  const [exams, setExams]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [paying, setPaying]           = useState(false);

  useEffect(() => { loadExams(); }, []);

  const loadExams = async () => {
    try {
      const { exams } = await examService.getAvailableExams();
      setExams(exams);
    } catch (error) {
      console.error('Failed to load exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeExam = (exam) => {
    // Subscription required to take exams
    if (!isSubscribed) {
      toast.error('Please subscribe to take skill exams');
      navigate('/seeker/subscription');
      return;
    }
    setSelectedExam(exam);
  };

  const handlePayAndStart = async (exam) => {
    setPaying(true);
    try {
      const orderData = await paymentService.createExamOrder(exam.id);

      const paymentResponse = await paymentService.openRazorpay({
        key:         orderData.key,
        amount:      orderData.order.amount,
        currency:    orderData.order.currency,
        name:        'RuralJobs',
        description: `Skill Exam: ${exam.name}`,
        order_id:    orderData.order.id,
        prefill:     { contact: user?.mobile },
        theme:       { color: '#16a34a' },
      });

      await paymentService.verifyPayment({
        razorpay_order_id:    orderData.order.id,
        razorpay_payment_id:  paymentResponse.razorpay_payment_id,
        razorpay_signature:   paymentResponse.razorpay_signature,
      });

      toast.success('Payment successful! Starting exam...');
      setSelectedExam(null);
      navigate(`/seeker/exams/${exam.id}`);
    } catch (error) {
      if (error.message !== 'Payment cancelled') {
        toast.error('Payment failed. Please try again.');
      }
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  // Split exams: user's skills first, then others
  const mySkillExams    = exams.filter(e => e.isMySkill);
  const otherExams      = exams.filter(e => !e.isMySkill);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-6 text-white">
        <h1 className="text-xl font-bold">Skill Certification Exams</h1>
        <p className="text-yellow-100 mt-1">Pass exams to showcase your skills and stand out</p>
      </div>

      {/* Subscription notice */}
      {!isSubscribed && (
        <div className="mx-4 mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <p className="text-sm text-purple-800 font-medium">
            Subscription required to take exams
          </p>
          <button
            onClick={() => navigate('/seeker/subscription')}
            className="text-sm text-purple-600 font-semibold mt-1 flex items-center"
          >
            Upgrade now <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      )}

      {/* Benefits */}
      <div className="px-4 py-4">
        <div className="card p-4 bg-yellow-50 border-yellow-200">
          <h3 className="font-semibold text-yellow-900 mb-2">Benefits of Certification</h3>
          <div className="space-y-1 text-sm text-yellow-800">
            <p className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-yellow-600" />Priority in search results</p>
            <p className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-yellow-600" />Skill badge on your profile</p>
            <p className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-yellow-600" />Higher chances of getting hired</p>
          </div>
        </div>
      </div>

      {/* My Skill Exams — shown first */}
      {mySkillExams.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex items-center mb-3">
            <Star className="w-4 h-4 text-yellow-500 mr-2" />
            <h2 className="font-semibold text-gray-900">Your Skill Exams</h2>
          </div>
          <div className="space-y-3">
            {mySkillExams.map(exam => (
              <ExamCard
                key={exam.id}
                exam={exam}
                isSubscribed={isSubscribed}
                onTake={handleTakeExam}
                highlight
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Exams */}
      {otherExams.length > 0 && (
        <div className="px-4 py-2">
          <h2 className="font-semibold text-gray-900 mb-3">
            {mySkillExams.length > 0 ? 'Other Exams' : 'Available Exams'}
          </h2>
          <div className="space-y-3">
            {otherExams.map(exam => (
              <ExamCard
                key={exam.id}
                exam={exam}
                isSubscribed={isSubscribed}
                onTake={handleTakeExam}
              />
            ))}
          </div>
        </div>
      )}

      {exams.length === 0 && (
        <div className="px-4 py-8 text-center">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No exams available at the moment</p>
        </div>
      )}

      {/* Pay & Start Modal */}
      <Modal
        isOpen={!!selectedExam}
        onClose={() => setSelectedExam(null)}
        title={`${selectedExam?.name} Exam`}
      >
        {selectedExam && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-2">Exam Details</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 10 Multiple Choice Questions</li>
                <li>• Time Limit: 15 minutes</li>
                <li>• Pass Mark: 60% (6/10 correct)</li>
                <li>• Fee: ₹49 per attempt</li>
              </ul>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Each attempt requires a new payment if you don't pass.
              </p>
            </div>
            <Button
              fullWidth
              loading={paying}
              onClick={() => handlePayAndStart(selectedExam)}
              icon={ArrowRight}
              iconPosition="right"
            >
              Pay ₹49 & Start Exam
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

// Extracted card component for cleaner code
const ExamCard = ({ exam, isSubscribed, onTake, highlight = false }) => (
  <div className={`card p-4 ${highlight ? 'border-yellow-300 bg-yellow-50/30' : ''}`}>
    <div className="flex items-start justify-between">
      <div className="flex items-start space-x-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          exam.passed ? 'bg-green-100' : highlight ? 'bg-yellow-100' : 'bg-gray-100'
        }`}>
          <Award className={`w-6 h-6 ${
            exam.passed ? 'text-green-600' : highlight ? 'text-yellow-600' : 'text-gray-500'
          }`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{exam.name}</h3>
            {highlight && !exam.passed && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Your skill</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{exam.category}</p>
          <p className="text-xs text-gray-400 mt-1">{exam.question_count} questions • 15 mins</p>
        </div>
      </div>

      {exam.passed ? (
        <Badge variant="success">Passed ✓</Badge>
      ) : (
        <span className="text-sm font-semibold text-gray-900">₹49</span>
      )}
    </div>

    {!exam.passed && (
      <Button
        fullWidth
        size="sm"
        variant={highlight ? 'primary' : 'secondary'}
        className="mt-4"
        onClick={() => onTake(exam)}
      >
        {isSubscribed ? 'Take Exam' : 'Subscribe to Take Exam'}
      </Button>
    )}
  </div>
);

export default ExamList;