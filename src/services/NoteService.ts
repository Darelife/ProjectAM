import { supabase, handleSupabaseError } from '../lib/supabase'
import { Note, NoteInsert, NoteUpdate } from '../types/Database'

export const NoteService = {
  async getAll(): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false })
      
      if (error) handleSupabaseError(error)
      return data || []
    } catch (error) {
      console.error('Error fetching notes:', error)
      return []
    }
  },

  async getById(id: string): Promise<Note | null> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        handleSupabaseError(error)
      }
      
      return data
    } catch (error) {
      console.error('Error fetching note:', error)
      return null
    }
  },

  async create(noteData: Omit<NoteInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          ...noteData,
          tags: noteData.tags || [],
          linked_note_ids: noteData.linked_note_ids || []
        }])
        .select()
        .single()
      
      if (error) handleSupabaseError(error)
      return data
    } catch (error) {
      console.error('Error creating note:', error)
      throw error
    }
  },

  async update(id: string, updates: NoteUpdate): Promise<Note | null> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') return null // Not found
        handleSupabaseError(error)
      }
      
      return data
    } catch (error) {
      console.error('Error updating note:', error)
      return null
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
      
      if (error) handleSupabaseError(error)
      return true
    } catch (error) {
      console.error('Error deleting note:', error)
      return false
    }
  },

  async searchByContent(query: string): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('updated_at', { ascending: false })
      
      if (error) handleSupabaseError(error)
      return data || []
    } catch (error) {
      console.error('Error searching notes:', error)
      return []
    }
  },

  async getByTag(tag: string): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .contains('tags', [tag])
        .order('updated_at', { ascending: false })
      
      if (error) handleSupabaseError(error)
      return data || []
    } catch (error) {
      console.error('Error fetching notes by tag:', error)
      return []
    }
  },

  async getRecent(limit: number = 5): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(limit)
      
      if (error) handleSupabaseError(error)
      return data || []
    } catch (error) {
      console.error('Error fetching recent notes:', error)
      return []
    }
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
    try {
      const notes = await this.getAll();
      const targetNote = notes.find(n => n.id === noteId);
      if (!targetNote) return [];

      return notes.filter(note => {
        // Check explicit linked_note_ids
        if (note.linked_note_ids.includes(noteId)) return true;
        
        // Check for backlinks in content using [[Note Title]] syntax
        const backlinks = this.extractBacklinks(note.content);
        return backlinks.includes(targetNote.title);
      });
    } catch (error) {
      console.error('Error fetching backlinks:', error);
      return [];
    }
  },

  // Get all note connections for graph visualization
  async getGraphData(): Promise<{
    nodes: Array<{ id: string; title: string; tags: string[]; size: number; color: string }>;
    links: Array<{ source: string; target: string; strength: number }>;
  }> {
    try {
      const notes = await this.getAll();
      const nodes = notes.map(note => ({
        id: note.id,
        title: note.title,
        tags: note.tags,
        size: Math.max(10, Math.min(30, note.content.length / 50)), // Size based on content length
        color: this.getNodeColor(note.tags)
      }));

      const links: Array<{ source: string; target: string; strength: number }> = [];
      
      for (const note of notes) {
        // Process explicit linked_note_ids
        for (const linkedId of note.linked_note_ids) {
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
    } catch (error) {
      console.error('Error fetching graph data:', error);
      return { nodes: [], links: [] };
    }
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
  async updateWithBacklinks(id: string, updates: NoteUpdate): Promise<Note | null> {
    try {
      const notes = await this.getAll();
      const note = notes.find(n => n.id === id);
      if (!note) return null;

      // If content is being updated, extract backlinks
      if (updates.content) {
        const backlinks = this.extractBacklinks(updates.content);
        const linkedNoteIds = [...(updates.linked_note_ids || note.linked_note_ids)];
        
        // Add notes referenced by backlinks to linked_note_ids
        for (const backlinkTitle of backlinks) {
          const targetNote = notes.find(n => n.title === backlinkTitle);
          if (targetNote && !linkedNoteIds.includes(targetNote.id)) {
            linkedNoteIds.push(targetNote.id);
          }
        }
        
        updates.linked_note_ids = linkedNoteIds;
      }

      return await this.update(id, updates);
    } catch (error) {
      console.error('Error updating note with backlinks:', error);
      return null;
    }
  }
}
