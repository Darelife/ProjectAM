"use client";

import { useState, useEffect } from 'react';
import { MotionDiv } from '@/components/ui/motion';
import { 
  X, 
  Calendar, 
  Flag, 
  Tag, 
  Target,
  FileText,
  Clock,
  Save
} from 'lucide-react';
import { Task } from '@/types/Task';

interface TaskFormProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  selectedDate?: Date | null;
}

export function TaskForm({ task, isOpen, onClose, onSave, selectedDate }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    eisenhowerQuadrant: undefined as Task['eisenhowerQuadrant'],
    dueDate: '',
    calendarDate: '',
    tags: [] as string[],
    linkedNoteIds: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        eisenhowerQuadrant: task.eisenhowerQuadrant,
        dueDate: task.dueDate || '',
        calendarDate: task.calendarDate || '',
        tags: task.tags || [],
        linkedNoteIds: task.linkedNoteIds || []
      });
    } else {
      // Reset form for new task
      const defaultDate = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        eisenhowerQuadrant: undefined,
        dueDate: defaultDate,
        calendarDate: defaultDate,
        tags: [],
        linkedNoteIds: []
      });
    }
  }, [task, selectedDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSave({
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      eisenhowerQuadrant: formData.eisenhowerQuadrant,
      dueDate: formData.dueDate || undefined,
      calendarDate: formData.calendarDate || undefined,
      tags: formData.tags,
      linkedNoteIds: formData.linkedNoteIds
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-effect rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-teal-500" />
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
              className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus-ring"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus-ring resize-none"
            />
          </div>

          {/* Priority & Quadrant */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Flag className="w-4 h-4 inline mr-2" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus-ring"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Eisenhower Quadrant
              </label>
              <select
                value={formData.eisenhowerQuadrant || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  eisenhowerQuadrant: e.target.value ? e.target.value as Task['eisenhowerQuadrant'] : undefined 
                }))}
                className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus-ring"
              >
                <option value="">No Quadrant</option>
                <option value="do">Do (Urgent & Important)</option>
                <option value="schedule">Schedule (Important, Not Urgent)</option>
                <option value="delegate">Delegate (Urgent, Not Important)</option>
                <option value="delete">Delete (Neither Urgent nor Important)</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Calendar Date
              </label>
              <input
                type="date"
                value={formData.calendarDate}
                onChange={(e) => setFormData(prev => ({ ...prev, calendarDate: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus-ring"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Tag className="w-4 h-4 inline mr-2" />
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1 px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus-ring"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
              >
                Add
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm flex items-center gap-2"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg border border-border/40 hover:bg-background/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-lg button-primary flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </MotionDiv>
    </div>
  );
}
