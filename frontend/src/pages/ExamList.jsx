import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, CheckCircle, Lock, ArrowRight } from 'lucide-react';
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
  const { user, refreshUser } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    loadExams();
  }, []);

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

  const handlePayAndStart = async (exam) => {
    setPaying(true);
    try {
      // Create order
      const orderData = await paymentService.createExamOrder(exam.id);

      // Open Razorpay
      const paymentResponse = await paymentService.openRazorpay({
        key: orderData.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'RuralJobs',
        description: `Skill Exam: ${exam.name}`,
        order_id: orderData.order.id,
        prefill: {
          contact: user?.mobile,
        },
        theme: {
          color: '#16a34a',
        },
      });

      // Verify payment
      await paymentService.verifyPayment({
        razorpay_order_id: orderData.order.id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
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

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-6 text-white">
        <h1 className="text-xl font-bold">Skill Certification Exams</h1>
        <p className="text-yellow-100 mt-1">
          Pass exams to showcase your skills and stand out
        </p>
      </div>

      {/* Benefits */}
      <div className="px-4 py-4">
        <div className="card p-4 bg-yellow-50 border-yellow-200">
          <h3 className="font-semibold text-yellow-900 mb-2">Benefits of Certification</h3>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-yellow-600" />
              Get priority in search results
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-yellow-600" />
              Display skill badge on your profile
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-yellow-600" />
              Higher chances of getting hired
            </li>
          </ul>
        </div>
      </div>

      {/* Exam List */}
      <div className="px-4 py-2 space-y-3">
        <h2 className="font-semibold text-gray-900">Available Exams</h2>
        
        {exams.map((exam) => (
          <div key={exam.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center
                  ${exam.passed ? 'bg-green-100' : 'bg-yellow-100'}
                `}>
                  <Award className={`w-6 h-6 ${exam.passed ? 'text-green-600' : 'text-yellow-600'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{exam.name}</h3>
                  <p className="text-sm text-gray-500">{exam.category}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {exam.question_count} questions • 15 mins
                  </p>
                </div>
              </div>
              
              {exam.passed ? (
                <Badge variant="success">Passed</Badge>
              ) : (
                <span className="text-sm font-semibold text-gray-900">₹49</span>
              )}
            </div>

            {!exam.passed && (
              <Button
                fullWidth
                size="sm"
                className="mt-4"
                onClick={() => setSelectedExam(exam)}
              >
                Take Exam
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Exam Details Modal */}
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
                <strong>Note:</strong> You can retake the exam if you don't pass, but each attempt requires a new payment.
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

export default ExamList;