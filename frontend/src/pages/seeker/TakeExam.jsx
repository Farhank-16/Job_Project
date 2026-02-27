import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { examService } from '../../services/examService';
import { paymentService } from '../../services/paymentService';
import useAuth from '../../context/useAuth';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const TakeExam = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    startExam();
  }, [skillId]);

  useEffect(() => {
    if (timeLeft <= 0 || !examData) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, examData]);

  const startExam = async () => {
    try {
      const data = await examService.startExam(skillId);
      setExamData(data);
      setTimeLeft(data.timeLimit);
    } catch (error) {
      if (error.response?.data?.code === 'PAYMENT_REQUIRED') {
        toast.error('Please pay for the exam first');
        navigate('/seeker/exams');
      } else {
        toast.error('Failed to start exam');
        navigate('/seeker/exams');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmit = async () => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const resultData = await examService.submitExam(examData.attemptId, answers);
      setResult(resultData);
      setShowResult(true);
      
      if (resultData.passed) {
        await refreshUser();
      }
    } catch (error) {
      toast.error('Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!examData) {
    return null;
  }

  const question = examData.questions[currentQuestion];
  const totalQuestions = examData.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-14 bg-white border-b z-30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">Question</span>
            <span className="font-semibold ml-1">
              {currentQuestion + 1} / {totalQuestions}
            </span>
          </div>
          <div className={`flex items-center ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>
            <Clock className="w-5 h-5 mr-1" />
            <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-2 flex space-x-1">
          {examData.questions.map((q, i) => (
            <div
              key={q.id}
              className={`h-1.5 flex-1 rounded-full ${
                answers[q.id]
                  ? 'bg-primary-500'
                  : i === currentQuestion
                  ? 'bg-primary-200'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="px-4 py-6">
        <div className="card p-5">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            {question.question}
          </h2>

          <div className="space-y-3">
            {['a', 'b', 'c', 'd'].map((option) => {
              const optionKey = `option${option.toUpperCase()}`;
              const isSelected = answers[question.id] === option;

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(question.id, option)}
                  className={`
                    w-full p-4 rounded-xl border-2 text-left transition-all
                    ${isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-start">
                    <span className={`
                      w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0
                      ${isSelected
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {option.toUpperCase()}
                    </span>
                    <span className="text-gray-800 pt-1">
                      {question[optionKey]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t p-4 safe-bottom">
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            fullWidth
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(prev => prev - 1)}
          >
            Previous
          </Button>
          
          {currentQuestion < totalQuestions - 1 ? (
            <Button
              fullWidth
              onClick={() => setCurrentQuestion(prev => prev + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              fullWidth
              onClick={handleSubmit}
              loading={submitting}
              disabled={answeredCount < totalQuestions}
            >
              Submit ({answeredCount}/{totalQuestions})
            </Button>
          )}
        </div>
      </div>

      {/* Result Modal */}
      <Modal
        isOpen={showResult}
        onClose={() => {
          setShowResult(false);
          navigate('/seeker/exams');
        }}
        title="Exam Result"
      >
        {result && (
          <div className="text-center py-4">
            <div className={`
              w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4
              ${result.passed ? 'bg-green-100' : 'bg-red-100'}
            `}>
              {result.passed ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>

            <h3 className={`text-2xl font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
              {result.passed ? 'Congratulations!' : 'Not Passed'}
            </h3>
            
            <p className="text-gray-600 mt-2">{result.message}</p>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="text-4xl font-bold text-gray-900">
                {result.score} / {result.totalQuestions}
              </div>
              <div className="text-gray-500 mt-1">
                {result.percentage}% Score
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {result.passed ? (
                <Button fullWidth onClick={() => navigate('/seeker')}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button fullWidth onClick={() => navigate('/seeker/exams')}>
                    Try Again
                  </Button>
                  <p className="text-sm text-gray-500">
                    You need to pay again for a new attempt
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TakeExam;