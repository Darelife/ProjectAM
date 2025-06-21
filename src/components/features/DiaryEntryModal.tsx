"use client";

import { useState, useEffect } from 'react';
import { MotionDiv } from '../ui/motion';
import { 
  X, 
  Calendar, 
  Hash, 
  Heart,
  Smile,
  Meh,
  Frown,
  Save
} from 'lucide-react';

interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  mood: 'happy' | 'neutral' | 'sad' | 'excited';
  date: string;
  tags: string[];
  linkedNoteIds: string[];
  createdAt: string;
  updatedAt: string;
}

interface DiaryEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Partial<DiaryEntry>) => void;
  entry?: DiaryEntry | null;
}

function MoodIcon({ mood, className }: { mood: string; className?: string }) {
  switch (mood) {
    case 'happy':
      return <Smile className={`${className} text-green-500`} />;
    case 'excited':
      return <Heart className={`${className} text-pink-500`} />;
    case 'neutral':
      return <Meh className={`${className} text-yellow-500`} />;
    case 'sad':
      return <Frown className={`${className} text-blue-500`} />;
    default:
      return <Meh className={`${className} text-gray-500`} />;
  }
}

export function DiaryEntryModal({ isOpen, onClose, onSave, entry }: DiaryEntryModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    mood: 'neutral' as DiaryEntry['mood'],
    date: new Date().toISOString().split('T')[0],
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        date: entry.date,
        tags: entry.tags,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        mood: 'neutral',
        date: new Date().toISOString().split('T')[0],
        tags: [],
      });
    }
  }, [entry, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save diary entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const moodOptions = [
    { value: 'happy', label: 'Happy', icon: 'happy' },
    { value: 'excited', label: 'Excited', icon: 'excited' },
    { value: 'neutral', label: 'Neutral', icon: 'neutral' },
    { value: 'sad', label: 'Sad', icon: 'sad' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <MotionDiv
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-enhanced rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-border/40">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {entry ? 'Edit Entry' : 'New Diary Entry'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-background/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What's on your mind?"
              className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus-ring"
              required
            />
          </div>

          {/* Date and Mood */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-background/50 border border-border/40 focus-ring"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mood</label>
              <div className="grid grid-cols-4 gap-2">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, mood: mood.value as DiaryEntry['mood'] }))}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-colors ${
                      formData.mood === mood.value
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-background/50 border border-border/40 hover:bg-background/70'
                    }`}
                  >
                    <MoodIcon mood={mood.icon} className="w-6 h-6" />
                    <span className="text-xs">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write about your day, thoughts, feelings..."
              className="w-full px-4 py-3 rounded-lg bg-background/50 border border-border/40 focus-ring resize-none"
              rows={8}
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleTagInputKeyPress}
                    placeholder="Add tags..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-background/50 border border-border/40 focus-ring"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                >
                  Add
                </button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-primary/60 hover:text-primary"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-lg bg-background/50 border border-border/40 hover:bg-background/70 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 rounded-lg button-primary flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {entry ? 'Update Entry' : 'Save Entry'}
                </>
              )}
            </button>
          </div>
        </form>
      </MotionDiv>
    </div>
  );
}
