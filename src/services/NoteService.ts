import { JsonDB } from '../lib/jsonDB';
import { Note, NoteSchema, CreateNoteData } from '../types/Note';
import { v4 as uuidv4 } from 'uuid';

const db = new JsonDB<Note>('notes.json');

export const NoteService = {
  async getAll(): Promise<Note[]> {
    return await db.read();
  },

  async getById(id: string): Promise<Note | undefined> {
    const notes = await db.read();
    return notes.find(n => n.id === id);
  },

  async create(noteData: CreateNoteData): Promise<Note> {
    const now = new Date().toISOString();
    const newNote: Note = {
      ...noteData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      tags: noteData.tags || [],
      linkedNoteIds: noteData.linkedNoteIds || [],
    };
    
    NoteSchema.parse(newNote);
    const notes = await db.read();
    notes.push(newNote);
    await db.write(notes);
    return newNote;
  },

  async update(id: string, updates: Partial<Note>): Promise<Note | undefined> {
    const notes = await db.read();
    const idx = notes.findIndex(n => n.id === id);
    if (idx === -1) return undefined;
    
    const updated = { ...notes[idx], ...updates, updatedAt: new Date().toISOString() };
    NoteSchema.parse(updated);
    notes[idx] = updated;
    await db.write(notes);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const notes = await db.read();
    const filtered = notes.filter(n => n.id !== id);
    await db.write(filtered);
    return filtered.length < notes.length;
  },

  async searchByContent(query: string): Promise<Note[]> {
    const notes = await db.read();
    const lowerQuery = query.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowerQuery) || 
      note.content.toLowerCase().includes(lowerQuery) ||
      note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },

  async getByTag(tag: string): Promise<Note[]> {
    const notes = await db.read();
    return notes.filter(note => note.tags.includes(tag));
  },

  async getRecent(limit: number = 5): Promise<Note[]> {
    const notes = await db.read();
    return notes
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  },

  // Extract backlinks from note content using [[Note Name]] syntax
  extractBacklinks(content: string): string[] {
    const backlinkRegex = /\[\[([^\]]+)\]\]/g;
    const matches = [];
    let match;
    
    while ((match = backlinkRegex.exec(content)) !== null) {
      matches.push(match[1].trim());
    }
    
    return matches;
  },

  // Find notes that link to a specific note
  async getBacklinks(noteId: string): Promise<Note[]> {
    const notes = await db.read();
    const targetNote = notes.find(n => n.id === noteId);
    if (!targetNote) return [];

    return notes.filter(note => {
      // Check explicit linkedNoteIds
      if (note.linkedNoteIds.includes(noteId)) return true;
      
      // Check for backlinks in content using [[Note Title]] syntax
      const backlinks = this.extractBacklinks(note.content);
      return backlinks.includes(targetNote.title);
    });
  },

  // Get all note connections for graph visualization
  async getGraphData(): Promise<{
    nodes: Array<{ id: string; title: string; tags: string[]; size: number; color: string }>;
    links: Array<{ source: string; target: string; strength: number }>;
  }> {
    const notes = await db.read();
    const nodes = notes.map(note => ({
      id: note.id,
      title: note.title,
      tags: note.tags,
      size: Math.max(10, Math.min(30, note.content.length / 50)), // Size based on content length
      color: this.getNodeColor(note.tags)
    }));

    const links: Array<{ source: string; target: string; strength: number }> = [];
    
    for (const note of notes) {
      // Process explicit linkedNoteIds
      for (const linkedId of note.linkedNoteIds) {
        if (notes.find(n => n.id === linkedId)) {
          links.push({
            source: note.id,
            target: linkedId,
            strength: 1
          });
        }
      }
      
      // Process backlinks from content
      const backlinks = this.extractBacklinks(note.content);
      for (const backlinkTitle of backlinks) {
        const targetNote = notes.find(n => n.title === backlinkTitle);
        if (targetNote && targetNote.id !== note.id) {
          // Avoid duplicate links
          const existingLink = links.find(l => 
            (l.source === note.id && l.target === targetNote.id) ||
            (l.source === targetNote.id && l.target === note.id)
          );
          
          if (!existingLink) {
            links.push({
              source: note.id,
              target: targetNote.id,
              strength: 0.8
            });
          }
        }
      }
    }

    return { nodes, links };
  },

  // Get color based on note tags
  getNodeColor(tags: string[]): string {
    if (tags.includes('project')) return '#10b981'; // green
    if (tags.includes('meeting')) return '#3b82f6'; // blue
    if (tags.includes('idea')) return '#8b5cf6'; // purple
    if (tags.includes('important')) return '#ef4444'; // red
    if (tags.includes('daily')) return '#f59e0b'; // amber
    return '#06b6d4'; // teal (default)
  },

  // Update note and automatically detect backlinks
  async updateWithBacklinks(id: string, updates: Partial<Note>): Promise<Note | undefined> {
    const notes = await db.read();
    const note = notes.find(n => n.id === id);
    if (!note) return undefined;

    // If content is being updated, extract backlinks
    if (updates.content) {
      const backlinks = this.extractBacklinks(updates.content);
      const linkedNoteIds = [...(updates.linkedNoteIds || note.linkedNoteIds)];
      
      // Add notes referenced by backlinks to linkedNoteIds
      for (const backlinkTitle of backlinks) {
        const targetNote = notes.find(n => n.title === backlinkTitle);
        if (targetNote && !linkedNoteIds.includes(targetNote.id)) {
          linkedNoteIds.push(targetNote.id);
        }
      }
      
      updates.linkedNoteIds = linkedNoteIds;
    }

    return await this.update(id, updates);
  },
};
