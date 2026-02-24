import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Users, Briefcase, FileQuestion } from 'lucide-react';
import { adminService } from '../../services/adminService';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
  });

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const { skills } = await adminService.getSkills();
      setSkills(skills);
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Skill name is required');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await adminService.updateSkill(editing.id, formData);
        setSkills(prev => prev.map(s => 
          s.id === editing.id ? { ...s, ...formData } : s
        ));
        toast.success('Skill updated');
      } else {
        const { skill } = await adminService.createSkill(formData);
        setSkills(prev => [...prev, skill]);
        toast.success('Skill created');
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save skill');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', category: '', description: '' });
    setEditing(null);
  };

  const openEdit = (skill) => {
    setEditing(skill);
    setFormData({
      name: skill.name,
      category: skill.category || '',
      description: skill.description || '',
    });
    setShowModal(true);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="sticky top-14 bg-white border-b z-30 px-4 py-3 flex justify-between items-center">
        <h2 className="font-semibold text-gray-900">{skills.length} Skills</h2>
        <Button 
          size="sm" 
          icon={Plus}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add Skill
        </Button>
      </div>

      <div className="px-4 py-4 space-y-3">
        {skills.map((skill) => (
          <div key={skill.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{skill.name}</h3>
                {skill.category && (
                  <Badge size="xs" className="mt-1">{skill.category}</Badge>
                )}
              </div>
              <button
                onClick={() => openEdit(skill)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Edit2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {skill.description && (
              <p className="text-sm text-gray-500 mt-2">{skill.description}</p>
            )}

            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {skill.users_count || 0} users
              </span>
              <span className="flex items-center">
                <Briefcase className="w-4 h-4 mr-1" />
                {skill.jobs_count || 0} jobs
              </span>
              <span className="flex items-center">
                <FileQuestion className="w-4 h-4 mr-1" />
                {skill.questions_count || 0} questions
              </span>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Edit Skill' : 'Add Skill'}
      >
        <div className="space-y-4">
          <Input
            label="Skill Name *"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Tractor Driving"
          />
          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            placeholder="e.g., Agriculture"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="input"
              placeholder="Brief description of the skill"
            />
          </div>
          <Button fullWidth loading={saving} onClick={handleSave}>
            {editing ? 'Update' : 'Create'} Skill
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSkills;