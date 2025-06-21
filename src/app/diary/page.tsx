"use client";

import { useState, useEffect } from 'react';
import { TopBar } from '../../components/layout/TopBar';
import { MotionDiv } from '../../components/ui/motion';
import { 
  Plus, 
  Search, 
  Calendar, 
  Edit3, 
  Trash2, 
  Heart,
  Smile,
  Meh,
  Frown,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { DiaryEntryModal } from '../../components/features/DiaryEntryModal';
import { DiaryService, DiaryEntry } from '../../services';

interface DiaryEntryCardProps {
  entry: DiaryEntry;
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (id: string) => void;
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

function DiaryEntryCard({ entry, onEdit, onDelete }: DiaryEntryCardProps) {
  const getPreview = (content: string) => {
    return content.length > 300 ? content.substring(0, 300) + '...' : content;
  };

  const moodColors = {
    happy: 'border-green-500/30 bg-green-500/5',
    excited: 'border-pink-500/30 bg-pink-500/5',
    neutral: 'border-yellow-500/30 bg-yellow-500/5',
    sad: 'border-blue-500/30 bg-blue-500/5'
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-enhanced p-6 rounded-xl card-hover border-l-4 ${moodColors[entry.mood]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <MoodIcon mood={entry.mood} className="w-6 h-6 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-foreground">
                {entry.title}
              </h3>
              <span className="text-sm text-muted-foreground">
                {new Date(entry.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {getPreview(entry.content)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(entry)}
            className="p-2 hover:bg-background/50 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-2 hover:bg-background/50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>

      {entry.tags.length > 0 && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Tags:</span>
          {entry.tags.slice(0, 4).map(tag => (
            <span key={tag} className="px-2 py-1 rounded-full bg-primary/10 text-primary">
              #{tag}
            </span>
          ))}
          {entry.tags.length > 4 && (
            <span className="text-muted-foreground">+{entry.tags.length - 4} more</span>
          )}
        </div>
      )}
    </MotionDiv>
  );
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [filter, setFilter] = useState<{ search?: string; mood?: string; month?: string }>({});
  const [editing, setEditing] = useState<DiaryEntry | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchEntries();
  }, [filter]);

  const fetchEntries = async () => {
    try {
      const data = await DiaryService.getAll();
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch diary entries:', error);
      // Fallback to empty array if API fails
      setEntries([]);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await DiaryService.delete(id);
      if (success) {
        setEntries(prev => prev.filter(entry => entry.id !== id));
      } else {
        console.error('Failed to delete entry');
      }
    } catch (error) {
      console.error('Failed to delete entry:', error);
    }
  };

  const handleSaveEntry = async (entryData: Partial<DiaryEntry>) => {
    try {
      if (editing) {
        // Update existing entry
        const updatedEntry = await DiaryService.update(editing.id, entryData);
        if (updatedEntry) {
          setEntries(prev => prev.map(entry => 
            entry.id === editing.id ? updatedEntry : entry
          ));
          setEditing(null);
        }
      } else {
        // Create new entry
        const newEntry = await DiaryService.create(entryData as Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>);
        setEntries(prev => [newEntry, ...prev]);
      }
    } catch (error) {
      console.error('Failed to save entry:', error);
    }
  };

  const filteredEntries = entries.filter(entry => {
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      return entry.title.toLowerCase().includes(searchLower) ||
             entry.content.toLowerCase().includes(searchLower) ||
             entry.tags.some(tag => tag.toLowerCase().includes(searchLower));
    }
    if (filter.mood) {
      return entry.mood === filter.mood;
    }
    return true;
  });

  const getMoodStats = () => {
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return moodCounts;
  };

  const moodStats = getMoodStats();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <TopBar />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-teal-500" />
                <h1 className="text-4xl font-bold gradient-text">Diary</h1>
              </div>
            </Link>
            <button
              onClick={() => setShowCreateModal(true)}
              className="button-primary px-6 py-3 rounded-xl flex items-center gap-2 smooth-hover"
            >
              <Plus className="w-5 h-5" />
              New Entry
            </button>
          </div>

          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search diary entries..."
                value={filter.search || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-background/50 border border-border/40 focus-ring"
              />
            </div>
            
            <select
              value={filter.mood || ''}
              onChange={(e) => setFilter(prev => ({ ...prev, mood: e.target.value || undefined }))}
              className="px-4 py-2 rounded-lg bg-background/50 border border-border/40 focus-ring"
            >
              <option value="">All Moods</option>
              <option value="happy">😊 Happy</option>
              <option value="excited">💖 Excited</option>
              <option value="neutral">😐 Neutral</option>
              <option value="sad">😢 Sad</option>
            </select>
          </div>
        </MotionDiv>

        {/* Mood Statistics */}
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="glass-enhanced p-4 rounded-xl text-center">
            <MoodIcon mood="happy" className="w-6 h-6 mx-auto mb-2" />
            <div className="text-xl font-bold">{moodStats.happy || 0}</div>
            <div className="text-xs text-muted-foreground">Happy</div>
          </div>
          
          <div className="glass-enhanced p-4 rounded-xl text-center">
            <MoodIcon mood="excited" className="w-6 h-6 mx-auto mb-2" />
            <div className="text-xl font-bold">{moodStats.excited || 0}</div>
            <div className="text-xs text-muted-foreground">Excited</div>
          </div>
          
          <div className="glass-enhanced p-4 rounded-xl text-center">
            <MoodIcon mood="neutral" className="w-6 h-6 mx-auto mb-2" />
            <div className="text-xl font-bold">{moodStats.neutral || 0}</div>
            <div className="text-xs text-muted-foreground">Neutral</div>
          </div>
          
          <div className="glass-enhanced p-4 rounded-xl text-center">
            <MoodIcon mood="sad" className="w-6 h-6 mx-auto mb-2" />
            <div className="text-xl font-bold">{moodStats.sad || 0}</div>
            <div className="text-xs text-muted-foreground">Sad</div>
          </div>
        </MotionDiv>

        {/* Diary Entries */}
        <div className="space-y-6">
          {filteredEntries.length === 0 ? (
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No diary entries found</h3>
              <p className="text-muted-foreground mb-4">Start your journaling journey today!</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="button-primary px-6 py-3 rounded-xl flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Write First Entry
              </button>
            </MotionDiv>
          ) : (
            filteredEntries.map((entry, index) => (
              <MotionDiv
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <DiaryEntryCard
                  entry={entry}
                  onEdit={setEditing}
                  onDelete={handleDelete}
                />
              </MotionDiv>
            ))
          )}
        </div>
      </div>

      {/* Diary Entry Modal */}
      <DiaryEntryModal
        isOpen={showCreateModal || editing !== null}
        onClose={() => {
          setShowCreateModal(false);
          setEditing(null);
        }}
        onSave={handleSaveEntry}
        entry={editing}
      />
    </main>
  );
}
