import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Users, Briefcase, FileQuestion } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminSkills = () => {
  const [skills, setSkills]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState({ name: '', category: '', description: '' });

  useEffect(() => {
    adminService.getSkills()
      .then(({ skills }) => setSkills(skills))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Skill name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await adminService.updateSkill(editing.id, form);
        setSkills(p => p.map(s => s.id === editing.id ? { ...s, ...form } : s));
        toast.success('Skill updated');
      } else {
        const { skill } = await adminService.createSkill(form);
        setSkills(p => [...p, skill]);
        toast.success('Skill created');
      }
      setShowModal(false);
      setForm({ name: '', category: '', description: '' });
      setEditing(null);
    } catch { toast.error('Failed to save skill'); }
    finally { setSaving(false); }
  };

  const openEdit = (skill) => {
    setEditing(skill);
    setForm({ name: skill.name, category: skill.category || '', description: skill.description || '' });
    setShowModal(true);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">

      {/* Header bar */}
      <div className="sticky top-14 bg-white border-b border-slate-100 z-30 px-4 py-3 flex justify-between items-center">
        <p className="font-display font-bold text-slate-800 text-sm">{skills.length} Skills</p>
        <button
          onClick={() => { setForm({ name: '', category: '', description: '' }); setEditing(null); setShowModal(true); }}
          className="btn-primary px-4 py-2 text-sm gap-1.5"
          style={{ borderRadius: '10px' }}
        >
          <Plus className="w-4 h-4" /> Add Skill
        </button>
      </div>

      <div className="px-4 py-4 space-y-3">
        {skills.map(skill => (
          <div key={skill.id} className="card-elevated p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-slate-900 text-sm">{skill.name}</h3>
                  {skill.category && (
                    <span className="badge badge-blue text-xs">{skill.category}</span>
                  )}
                </div>
                {skill.description && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{skill.description}</p>
                )}
              </div>
              <button onClick={() => openEdit(skill)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 flex-shrink-0 transition-colors">
                <Edit2 className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
              {[
                { icon: Users,        val: skill.users_count     || 0, label: 'users' },
                { icon: Briefcase,    val: skill.jobs_count      || 0, label: 'jobs' },
                { icon: FileQuestion, val: skill.questions_count || 0, label: 'questions' },
              ].map(({ icon: Icon, val, label }) => (
                <span key={label} className="flex items-center gap-1 text-xs text-slate-500">
                  <Icon className="w-3.5 h-3.5" />{val} {label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editing ? 'Edit Skill' : 'Add Skill'}>
        <div className="space-y-4">
          <Input label="Skill Name *" value={form.name} onChange={set('name')} placeholder="e.g., Web Development" />
          <Input label="Category" value={form.category} onChange={set('category')} placeholder="e.g., Technology" />
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3}
              className="input" placeholder="Brief description..." />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="btn-primary w-full py-3.5 text-sm" style={{ borderRadius: '10px' }}>
            {saving
              ? <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              : `${editing ? 'Update' : 'Create'} Skill`
            }
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSkills;