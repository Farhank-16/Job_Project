import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { skillService } from '../../services/skillService';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { SkeletonList } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

const DIFF_STYLE = {
  easy:   { bg: '#f0fdf4', color: '#15803d' },
  medium: { bg: '#fefce8', color: '#92400e' },
  hard:   { bg: '#fff1f2', color: '#be123c' },
};

const BLANK = {
  skillId: '', question: '', optionA: '', optionB: '',
  optionC: '', optionD: '', correctOption: '', difficulty: 'medium',
};

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [skills, setSkills]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState(null);
  const [saving, setSaving]       = useState(false);
  const [skillFilter, setSkillFilter] = useState('');
  const [form, setForm]           = useState(BLANK);
  const [page, setPage]           = useState(1);

  useEffect(() => { setPage(1); }, [skillFilter]);
  useEffect(() => { loadData(); }, [skillFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [qData, sData] = await Promise.all([
        adminService.getQuestions({ skillId: skillFilter }),
        skillService.getSkills(),
      ]);
      setQuestions(qData.questions);
      setSkills(sData.skills);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Client-side pagination
  const totalPages = Math.ceil(questions.length / PAGE_SIZE) || 1;
  const safePage   = Math.min(page, totalPages);
  const pageStart  = (safePage - 1) * PAGE_SIZE;
  const pageEnd    = pageStart + PAGE_SIZE;
  const pageItems  = questions.slice(pageStart, pageEnd);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.skillId || !form.question || !form.correctOption) {
      toast.error('Fill all required fields'); return;
    }
    setSaving(true);
    try {
      if (editing) {
        await adminService.updateQuestion(editing.id, form);
        toast.success('Question updated');
      } else {
        await adminService.createQuestion(form);
        toast.success('Question created');
      }
      setShowModal(false);
      setForm(BLANK);
      setEditing(null);
      loadData();
    } catch { toast.error('Failed to save question'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    try {
      await adminService.deleteQuestion(id);
      setQuestions(p => p.filter(q => q.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const openEdit = (q) => {
    setEditing(q);
    setForm({
      skillId: q.skill_id, question: q.question,
      optionA: q.option_a, optionB: q.option_b,
      optionC: q.option_c, optionD: q.option_d,
      correctOption: q.correct_option, difficulty: q.difficulty,
    });
    setShowModal(true);
  };

  // Page number pills with ellipsis
  const pagePills = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
    .reduce((acc, p, i, arr) => {
      if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Sticky header */}
      <div className="sticky top-14 bg-white border-b border-slate-100 z-30 px-4 py-3 space-y-2.5">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-display font-bold text-slate-800 text-sm">
              {questions.length} Questions
            </p>
            {questions.length > 0 && (
              <p className="text-xs text-slate-400 mt-0.5">
                Showing {pageStart + 1}–{Math.min(pageEnd, questions.length)} of {questions.length}
              </p>
            )}
          </div>
          <button
            onClick={() => { setForm(BLANK); setEditing(null); setShowModal(true); }}
            className="btn-primary px-4 py-2 text-sm gap-1.5" style={{ borderRadius: '10px' }}>
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)}
          className="input w-full py-2.5 text-sm" style={{ borderRadius: '10px' }}>
          <option value="">All Skills</option>
          {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="px-4 py-4">
        {loading ? <SkeletonList count={5} /> : (
          <>
            <div className="space-y-3">
              {pageItems.map((q, idx) => (
                <div key={q.id} className="card-elevated p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-display font-bold text-slate-400">
                        #{pageStart + idx + 1}
                      </span>
                      <span className="badge badge-blue text-xs">{q.skill_name}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={DIFF_STYLE[q.difficulty] || DIFF_STYLE.medium}>
                        {q.difficulty}
                      </span>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(q)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100">
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      <button onClick={() => handleDelete(q.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <p className="font-display font-semibold text-slate-800 text-sm mb-3 leading-snug">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5">
                    {[['a', q.option_a], ['b', q.option_b], ['c', q.option_c], ['d', q.option_d]].map(([key, val]) => (
                      <div key={key}
                        className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-lg text-xs"
                        style={{
                          background: q.correct_option === key ? '#f0fdf4' : '#f8fafc',
                          color:      q.correct_option === key ? '#15803d' : '#64748b',
                          fontWeight: q.correct_option === key ? 700 : 400,
                          border:     q.correct_option === key ? '1px solid #bbf7d0' : '1px solid #f1f5f9',
                        }}>
                        <span className="font-bold uppercase">{key}.</span>
                        <span className="leading-tight">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-12">
                  <p className="font-display font-bold text-slate-700">No questions yet</p>
                  <p className="text-xs text-slate-400 mt-1">Add your first question above</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                <button
                  disabled={safePage === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-display font-semibold text-slate-600 disabled:opacity-40 active:scale-95 transition-all">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>

                <div className="flex items-center gap-1.5">
                  {pagePills.map((p, i) =>
                    p === '...'
                      ? <span key={`d${i}`} className="text-slate-400 text-xs px-1">…</span>
                      : <button key={p} onClick={() => setPage(p)}
                          className="w-8 h-8 rounded-lg text-xs font-display font-bold transition-all"
                          style={{
                            background: safePage === p ? '#2563eb' : '#f1f5f9',
                            color:      safePage === p ? 'white'   : '#64748b',
                          }}>
                          {p}
                        </button>
                  )}
                </div>

                <button
                  disabled={safePage === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-display font-semibold text-slate-600 disabled:opacity-40 active:scale-95 transition-all">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editing ? 'Edit Question' : 'Add Question'} size="lg">
        <div className="space-y-4">
          <Select label="Skill *" value={form.skillId} onChange={set('skillId')}
            options={skills.map(s => ({ value: s.id, label: s.name }))} placeholder="Select skill" />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Question *</label>
            <textarea value={form.question} onChange={set('question')} rows={3}
              className="input" placeholder="Enter the question..." />
          </div>

          {[['optionA','Option A *'],['optionB','Option B *'],['optionC','Option C *'],['optionD','Option D *']].map(([k, label]) => (
            <Input key={k} label={label} value={form[k]} onChange={set(k)} />
          ))}

          <Select label="Correct Answer *" value={form.correctOption} onChange={set('correctOption')}
            options={[
              { value: 'a', label: 'A' }, { value: 'b', label: 'B' },
              { value: 'c', label: 'C' }, { value: 'd', label: 'D' },
            ]} placeholder="Select correct option" />

          <Select label="Difficulty" value={form.difficulty} onChange={set('difficulty')}
            options={[
              { value: 'easy',   label: 'Easy'   },
              { value: 'medium', label: 'Medium' },
              { value: 'hard',   label: 'Hard'   },
            ]} />

          <button onClick={handleSave} disabled={saving}
            className="btn-primary w-full py-3.5 text-sm" style={{ borderRadius: '10px' }}>
            {saving
              ? <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              : `${editing ? 'Update' : 'Create'} Question`
            }
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminQuestions;