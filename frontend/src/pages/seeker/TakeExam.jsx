import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { examService } from '../../services/examService';
import useAuth from '../../context/useAuth';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const TakeExam = () => {
  const { skillId }        = useParams();
  const navigate           = useNavigate();
  const { refreshUser }    = useAuth();

  const [loading, setLoading]     = useState(true);
  const [examData, setExamData]   = useState(null);
  const [current, setCurrent]     = useState(0);
  const [answers, setAnswers]     = useState({});
  const [timeLeft, setTimeLeft]   = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]       = useState(null);

  useEffect(() => {
    examService.startExam(skillId)
      .then(data => { setExamData(data); setTimeLeft(data.timeLimit); })
      .catch(err => {
        toast.error(err.response?.data?.code === 'PAYMENT_REQUIRED'
          ? 'Please pay for the exam first' : 'Failed to start exam');
        navigate('/seeker/exams');
      })
      .finally(() => setLoading(false));
  }, [skillId]);

  // Countdown
  useEffect(() => {
    if (!timeLeft || !examData) return;
    const t = setInterval(() => {
      setTimeLeft(p => { if (p <= 1) { handleSubmit(); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(t);
  }, [timeLeft, examData]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await examService.submitExam(examData.attemptId, answers);
      setResult(res);
      if (res.passed) await refreshUser();
    } catch { toast.error('Failed to submit exam'); }
    finally { setSubmitting(false); }
  };

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const isRed = timeLeft < 60;

  if (loading)   return <LoadingSpinner fullScreen />;
  if (!examData) return null;

  const q            = examData.questions[current];
  const total        = examData.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-28">

      {/* Sticky header */}
      <div className="sticky top-14 bg-white border-b border-slate-100 z-30 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-500 font-medium">
            Question <span className="font-display font-bold text-slate-900">{current + 1}</span> / {total}
          </p>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
            style={{ background: isRed ? '#fff1f2' : '#f1f5f9' }}>
            <Clock className="w-3.5 h-3.5" style={{ color: isRed ? '#be123c' : '#64748b' }} />
            <span className="font-mono font-bold text-sm" style={{ color: isRed ? '#be123c' : '#0f172a' }}>
              {fmt(timeLeft)}
            </span>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1">
          {examData.questions.map((item, i) => (
            <div key={item.id} className="h-1.5 flex-1 rounded-full transition-all"
              style={{
                background: answers[item.id] ? '#2563eb' : i === current ? '#bfdbfe' : '#e2e8f0'
              }} />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="px-4 py-5">
        <div className="card-elevated p-5">
          <p className="font-display font-bold text-slate-900 text-base leading-snug mb-5">
            {q.question}
          </p>

          <div className="space-y-2.5">
            {['a','b','c','d'].map(opt => {
              const selected = answers[q.id] === opt;
              return (
                <button key={opt} onClick={() => setAnswers(p => ({ ...p, [q.id]: opt }))}
                  className="w-full p-3.5 rounded-xl border-2 text-left transition-all active:scale-[0.98]"
                  style={{
                    borderColor: selected ? '#2563eb' : '#e2e8f0',
                    background:  selected ? '#eff6ff' : 'white',
                  }}>
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold flex-shrink-0"
                      style={{
                        background: selected ? '#2563eb' : '#f1f5f9',
                        color:      selected ? 'white'   : '#64748b',
                      }}>
                      {opt.toUpperCase()}
                    </span>
                    <span className="text-sm text-slate-700 leading-snug pt-0.5">
                      {q[`option${opt.toUpperCase()}`]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-slate-100 px-4 py-3 safe-bottom">
        <div className="flex gap-3">
          <button disabled={current === 0} onClick={() => setCurrent(p => p - 1)}
            className="btn-secondary flex-1 py-3 text-sm disabled:opacity-40" style={{ borderRadius: '10px' }}>
            Previous
          </button>
          {current < total - 1 ? (
            <button onClick={() => setCurrent(p => p + 1)}
              className="btn-primary flex-1 py-3 text-sm" style={{ borderRadius: '10px' }}>
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={answeredCount < total || submitting}
              className="btn-primary flex-1 py-3 text-sm disabled:opacity-50" style={{ borderRadius: '10px' }}>
              {submitting
                ? <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </span>
                : `Submit (${answeredCount}/${total})`
              }
            </button>
          )}
        </div>
      </div>

      {/* Result Modal */}
      <Modal isOpen={!!result} onClose={() => { setResult(null); navigate('/seeker/exams'); }} title="Exam Result">
        {result && (
          <div className="text-center py-4">
            <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4"
              style={{ background: result.passed ? '#f0fdf4' : '#fff1f2' }}>
              {result.passed
                ? <CheckCircle2 className="w-10 h-10 text-green-600" />
                : <XCircle     className="w-10 h-10 text-red-500" />
              }
            </div>

            <h3 className="font-display text-2xl font-extrabold mb-2"
              style={{ color: result.passed ? '#15803d' : '#be123c' }}>
              {result.passed ? 'Congratulations! 🎉' : 'Not Passed'}
            </h3>
            <p className="text-slate-500 text-sm mb-5">{result.message}</p>

            <div className="card p-4 mb-5">
              <p className="font-display text-4xl font-extrabold text-slate-900">
                {result.score}/{result.totalQuestions}
              </p>
              <p className="text-slate-400 text-sm mt-1">{result.percentage}% Score</p>
            </div>

            {result.passed ? (
              <button onClick={() => navigate('/seeker')}
                className="btn-primary w-full py-3.5 text-sm" style={{ borderRadius: '10px' }}>
                Go to Dashboard
              </button>
            ) : (
              <div className="space-y-3">
                <button onClick={() => navigate('/seeker/exams')}
                  className="btn-primary w-full py-3.5 text-sm" style={{ borderRadius: '10px' }}>
                  Try Again
                </button>
                <p className="text-xs text-slate-400">New attempt requires another payment</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TakeExam;