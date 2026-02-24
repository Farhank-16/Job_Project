import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { skillService } from '../../services/skillService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { SkeletonList } from '../../components/ui/Skeleton';
import toast from 'react-hot-toast';

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [skillFilter, setSkillFilter] = useState('');
  const [formData, setFormData] = useState({
    skillId: '',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: '',
    difficulty: 'medium',
  });

  useEffect(() => {
    loadData();
  }, [skillFilter]);

  const loadData = async () => {
    try {
      const [questionsData, skillsData] = await Promise.all([
        adminService.getQuestions({ skillId: skillFilter }),
        skillService.getSkills(),
      ]);
      setQuestions(questionsData.questions);
      setSkills(skillsData.skills);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.skillId || !formData.question || !formData.correctOption) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await adminService.updateQuestion(editing.id, formData);
        toast.success('Question updated');
      } else {
        await adminService.createQuestion(formData);
        toast.success('Question created');
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error('Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    
    try {
      await adminService.deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success('Question deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({
      skillId: '',
      question: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctOption: '',
      difficulty: 'medium',
    });
    setEditing(null);
  };

  const openEdit = (q) => {
    setEditing(q);
    setFormData({
      skillId: q.skill_id,
      question: q.question,
      optionA: q.option_a,
      optionB: q.option_b,
      optionC: q.option_c,
      optionD: q.option_d,
      correctOption: q.correct_option,
      difficulty: q.difficulty,
    });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-14 bg-white border-b z-30 px-4 py-3 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">{questions.length} Questions</h2>
          <Button 
            size="sm" 
            icon={Plus}
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            Add
          </Button>
        </div>
        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Skills</option>
          {skills.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <SkeletonList count={5} />
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="card p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Badge size="xs" variant="primary">{q.skill_name}</Badge>
                    <p className="mt-2 font-medium text-gray-900">{q.question}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div className={q.correct_option === 'a' ? 'text-green-600 font-medium' : 'text-gray-600'}>
                        A: {q.option_a}
                      </div>
                      <div className={q.correct_option === 'b' ? 'text-green-600 font-medium' : 'text-gray-600'}>
                        B: {q.option_b}
                      </div>
                      <div className={q.correct_option === 'c' ? 'text-green-600 font-medium' : 'text-gray-600'}>
                        C: {q.option_c}
                      </div>
                      <div className={q.correct_option === 'd' ? 'text-green-600 font-medium' : 'text-gray-600'}>
                        D: {q.option_d}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => openEdit(q)}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Question' : 'Add Question'}
        size="lg"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <Select
            label="Skill *"
            value={formData.skillId}
            onChange={(e) => setFormData(prev => ({ ...prev, skillId: e.target.value }))}
            options={skills.map(s => ({ value: s.id, label: s.name }))}
            placeholder="Select skill"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              rows={3}
              className="input"
              placeholder="Enter the question"
            />
          </div>

          <Input
            label="Option A *"
            value={formData.optionA}
            onChange={(e) => setFormData(prev => ({ ...prev, optionA: e.target.value }))}
          />
          <Input
            label="Option B *"
            value={formData.optionB}
            onChange={(e) => setFormData(prev => ({ ...prev, optionB: e.target.value }))}
          />
          <Input
            label="Option C *"
            value={formData.optionC}
            onChange={(e) => setFormData(prev => ({ ...prev, optionC: e.target.value }))}
          />
          <Input
            label="Option D *"
            value={formData.optionD}
            onChange={(e) => setFormData(prev => ({ ...prev, optionD: e.target.value }))}
          />

          <Select
            label="Correct Answer *"
            value={formData.correctOption}
            onChange={(e) => setFormData(prev => ({ ...prev, correctOption: e.target.value }))}
            options={[
              { value: 'a', label: 'Option A' },
              { value: 'b', label: 'Option B' },
              { value: 'c', label: 'Option C' },
              { value: 'd', label: 'Option D' },
            ]}
            placeholder="Select correct answer"
          />

          <Select
            label="Difficulty"
            value={formData.difficulty}
            onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
            options={[
              { value: 'easy', label: 'Easy' },
              { value: 'medium', label: 'Medium' },
              { value: 'hard', label: 'Hard' },
            ]}
          />

          <Button fullWidth loading={saving} onClick={handleSave}>
            {editing ? 'Update' : 'Create'} Question
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminQuestions;