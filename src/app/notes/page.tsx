"use client";

import { useState, useEffect } from 'react';
import { MotionDiv } from '@/components/ui/motion';
import {
  Plus,
  Search,
  FileText,
  Edit3,
  Trash2,
  Link,
  Calendar,
  Hash,
  BookOpen,
  Save,
  X,
  Network,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import NextLink from 'next/link';
import { NoteService } from '@/services/NoteService';
import { Note, CreateNoteData } from '@/types/Note';
import { TopBar } from '../../components/layout/TopBar';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onViewBacklinks: (note: Note) => void;
}

function NoteCard({ note, onEdit, onDelete, onViewBacklinks }: NoteCardProps) {
  const getPreview = (content: string) => {
    // Remove markdown-style backlinks from preview
    const cleanContent = content.replace(/\[\[([^\]]+)\]\]/g, '$1');
    return cleanContent.length > 200 ? cleanContent.substring(0, 200) + '...' : cleanContent;
  };

  const getBacklinkCount = (content: string) => {
    const matches = content.match(/\[\[([^\]]+)\]\]/g);
    return matches ? matches.length : 0;
  };

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect p-6 rounded-xl card-hover border-l-4 border-teal-500/30 bg-teal-500/5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {note.title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {getPreview(note.content)}
          </p>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onViewBacklinks(note)}
            className="p-2 hover:bg-background/50 rounded-lg transition-colors"
            title="View connections"
          >
            <Network className="w-4 h-4 text-muted-foreground hover:text-purple-500" />
          </button>
          <button
            onClick={() => onEdit(note)}
            className="p-2 hover:bg-background/50 rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4 text-muted-foreground hover:text-primary" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-2 hover:bg-background/50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          {note.tags.length > 0 && (
            <div className="flex items-center gap-1">
              <Hash className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">
                {note.tags.slice(0, 3).join(', ')}
                {note.tags.length > 3 && ` +${note.tags.length - 3}`}
              </span>
            </div>
          )}
          
          {getBacklinkCount(note.content) > 0 && (
            <div className="flex items-center gap-1 text-purple-500">
              <Link className="w-3 h-3" />
              <span>{getBacklinkCount(note.content)} backlinks</span>
            </div>
          )}
          
          {note.linkedNoteIds.length > 0 && (
            <div className="flex items-center gap-1 text-teal-500">
              <Link className="w-3 h-3" />
              <span>{note.linkedNoteIds.length} links</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="w-3 h-3" />
          {new Date(note.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </MotionDiv>
  );
}

// Note Editor Component
interface NoteEditorProps {
  initialNote?: Note | null;
  onSave: (note: Note | CreateNoteData) => void;
  onCancel: () => void;
  previewMode: boolean;
  availableNotes: Note[];
}

function NoteEditor({ initialNote, onSave, onCancel, previewMode, availableNotes }: NoteEditorProps) {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [tags, setTags] = useState<string[]>(initialNote?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const handleSave = () => {
    if (!title.trim()) return;

    const noteData = {
      title: title.trim(),
      content: content.trim(),
      tags: tags.filter(tag => tag.trim()),
      linkedNoteIds: [],
    };

    if (initialNote) {
      onSave({
        ...initialNote,
        ...noteData,
      });
    } else {
      onSave(noteData);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const renderPreview = (text: string) => {
    // Simple preview that highlights backlinks
    return text.replace(/\[\[([^\]]+)\]\]/g, (match, title) => {
      const linkedNote = availableNotes.find(n => n.title === title);
      return linkedNote 
        ? `<span class="text-purple-400 underline">${title}</span>`
        : `<span class="text-red-400">${title} (not found)</span>`;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title..."
          className="w-full px-4 py-3 glass-effect rounded-xl border border-border/40 focus:border-teal-500/50 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Content</label>
        {previewMode ? (
          <div 
            className="w-full min-h-64 p-4 glass-effect rounded-xl border border-border/40 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
          />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note... Use [[Note Title]] to create backlinks"
            className="w-full min-h-64 px-4 py-3 glass-effect rounded-xl border border-border/40 focus:border-teal-500/50 focus:outline-none resize-none"
          />
        )}
        <div className="mt-2 text-xs text-muted-foreground">
          Use [[Note Title]] syntax to create backlinks to other notes
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="Add tag..."
            className="flex-1 px-4 py-2 glass-effect rounded-lg border border-border/40 focus:border-teal-500/50 focus:outline-none"
          />
          <button
            onClick={addTag}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm flex items-center gap-2"
            >
              #{tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-purple-300 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-4 pt-6 border-t border-border/40">
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {initialNote ? 'Update Note' : 'Create Note'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 glass-effect border border-border/40 hover:bg-background/50 rounded-xl font-medium transition-all duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [editing, setEditing] = useState<Note | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [backlinksView, setBacklinksView] = useState<Note | null>(null);
  const [backlinksData, setBacklinksData] = useState<Note[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (backlinksView) {
      loadBacklinks(backlinksView.id);
    }
  }, [backlinksView]);

  const loadBacklinks = async (noteId: string) => {
    try {
      const backlinks = await NoteService.getBacklinks(noteId);
      setBacklinksData(backlinks);
    } catch (error) {
      console.error('Failed to load backlinks:', error);
    }
  };

  const loadNotes = async () => {
    try {
      const loadedNotes = await NoteService.getAll();
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateNoteData) => {
    try {
      const newNote = await NoteService.create(data);
      setNotes(prev => [newNote, ...prev]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleEdit = async (note: Note) => {
    try {
      const updatedNote = await NoteService.update(note.id, {
        title: note.title,
        content: note.content,
        tags: note.tags
      });
      if (updatedNote) {
        setNotes(prev => prev.map(n => n.id === note.id ? updatedNote : n));
        setEditing(null);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await NoteService.delete(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleViewBacklinks = (note: Note) => {
    setBacklinksView(note);
  };

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTag = selectedTag === '' || note.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  // Get all unique tags
  const allTags = Array.from(new Set(notes.flatMap(note => note.tags)));

  // Get statistics
  const stats = {
    totalNotes: notes.length,
    totalBacklinks: notes.reduce((sum, note) => 
      sum + NoteService.extractBacklinks(note.content).length, 0),
    totalDirectLinks: notes.reduce((sum, note) => sum + note.linkedNoteIds.length, 0),
    totalTags: allTags.length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <MotionDiv
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <NextLink href="/" className="cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-teal-500" />
              <h1 className="text-4xl font-bold gradient-text">
                Knowledge Notes
              </h1>
            </div>
          </NextLink>
          <p className="text-muted-foreground">
            Capture ideas, link concepts, and build your knowledge base with backlink support
          </p>
        </MotionDiv>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-effect rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-teal-500">{stats.totalNotes}</div>
            <div className="text-sm text-muted-foreground">Total Notes</div>
          </div>
          <div className="glass-effect rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">{stats.totalBacklinks}</div>
            <div className="text-sm text-muted-foreground">Backlinks</div>
          </div>
          <div className="glass-effect rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{stats.totalDirectLinks}</div>
            <div className="text-sm text-muted-foreground">Direct Links</div>
          </div>
          <div className="glass-effect rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.totalTags}</div>
            <div className="text-sm text-muted-foreground">Tags</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass-effect rounded-xl border border-border/40 focus:border-teal-500/50 focus:outline-none"
            />
          </div>
          
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-4 py-3 glass-effect rounded-xl border border-border/40 focus:border-teal-500/50 focus:outline-none"
          >
            <option value="">All Tags</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>#{tag}</option>
            ))}
          </select>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Note
          </button>
          
          <a
            href="/graph"
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Network className="w-5 h-5" />
            Graph View
          </a>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No notes found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedTag ? 'Try adjusting your filters' : 'Create your first note to get started'}
            </p>
            {!searchTerm && !selectedTag && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Create First Note
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={setEditing}
                onDelete={handleDelete}
                onViewBacklinks={handleViewBacklinks}
              />
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || editing) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-effect rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editing ? 'Edit Note' : 'Create New Note'}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="p-2 hover:bg-background/50 rounded-lg transition-colors"
                    title={previewMode ? 'Edit mode' : 'Preview mode'}
                  >
                    {previewMode ? <Edit3 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditing(null);
                      setPreviewMode(false);
                    }}
                    className="p-2 hover:bg-background/50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <NoteEditor
                initialNote={editing}
                onSave={(note) => editing ? handleEdit(note as Note) : handleCreate(note as CreateNoteData)}
                onCancel={() => {
                  setShowCreateModal(false);
                  setEditing(null);
                  setPreviewMode(false);
                }}
                previewMode={previewMode}
                availableNotes={notes.filter(n => n.id !== editing?.id)}
              />
            </MotionDiv>
          </div>
        )}

        {/* Backlinks Modal */}
        {backlinksView && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-effect rounded-xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Network className="w-6 h-6 text-purple-500" />
                  <h2 className="text-xl font-bold">Connections</h2>
                </div>
                <button
                  onClick={() => setBacklinksView(null)}
                  className="p-2 hover:bg-background/50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">{backlinksView.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {backlinksView.content.substring(0, 200)}
                  {backlinksView.content.length > 200 && '...'}
                </p>
              </div>

              <div className="space-y-6">
                {/* Backlinks (notes that link to this note) */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-purple-500" />
                    Backlinks ({backlinksData.length})
                  </h4>
                  <div className="space-y-2">
                    {backlinksData.map(note => (
                      <div key={note.id} className="p-3 glass-effect rounded-lg">
                        <div className="font-medium text-sm mb-1">{note.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {note.content.substring(0, 150)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Direct links (notes this note links to) */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Link className="w-4 h-4 text-teal-500" />
                    Direct Links ({backlinksView.linkedNoteIds.length})
                  </h4>
                  <div className="space-y-2">
                    {backlinksView.linkedNoteIds.map(linkedId => {
                      const linkedNote = notes.find(n => n.id === linkedId);
                      return linkedNote ? (
                        <div key={linkedNote.id} className="p-3 glass-effect rounded-lg">
                          <div className="font-medium text-sm mb-1">{linkedNote.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {linkedNote.content.substring(0, 150)}...
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {NoteService.extractBacklinks(backlinksView.content).length === 0 && 
                 backlinksView.linkedNoteIds.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No connections found</p>
                    <p className="text-sm">Add [[Note Title]] links in your content</p>
                  </div>
                )}
              </div>
            </MotionDiv>
          </div>
        )}
      </div>
    </div>
  );
}