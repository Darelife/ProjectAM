import { Task } from '../types/Task';
import { DiaryEntry } from '../types/DiaryEntry';

// TaskService that uses API routes
export const TaskService = {
  async getAll(): Promise<Task[]> {
    const response = await fetch('/api/tasks');
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  async getById(id: string): Promise<Task | undefined> {
    const response = await fetch(`/api/tasks?id=${id}`);
    if (!response.ok) return undefined;
    const tasks = await response.json();
    return Array.isArray(tasks) ? tasks[0] : tasks;
  },

  async create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    if (!response.ok) throw new Error('Failed to create task');
    return response.json();
  },

  async update(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const response = await fetch(`/api/tasks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates })
    });
    if (!response.ok) return undefined;
    return response.json();
  },

  async delete(id: string): Promise<boolean> {
    const response = await fetch(`/api/tasks`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    return response.ok;
  },

  async getByDate(date: string): Promise<Task[]> {
    const response = await fetch(`/api/tasks?date=${date}`);
    if (!response.ok) throw new Error('Failed to fetch tasks by date');
    return response.json();
  },

  async getByQuadrant(quadrant: Task['eisenhowerQuadrant']): Promise<Task[]> {
    const response = await fetch(`/api/tasks?quadrant=${quadrant}`);
    if (!response.ok) throw new Error('Failed to fetch tasks by quadrant');
    return response.json();
  },

  async linkToNote(taskId: string, noteId: string): Promise<Task | undefined> {
    const response = await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id: taskId, 
        linkedNoteIds: [noteId] // This might need to be handled differently depending on your logic
      })
    });
    if (!response.ok) return undefined;
    return response.json();
  },
};

// Create a unified DiaryService that checks environment and delegates appropriately
export const DiaryService = {
  async getAll(): Promise<DiaryEntry[]> {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      // We're in Electron
      return await (window as any).electronAPI.getDiaryEntries();
    } else {
      // We're in web/Next.js environment - use fetch API
      const response = await fetch('/api/diary');
      if (!response.ok) throw new Error('Failed to fetch diary entries');
      return response.json();
    }
  },

  async getById(id: string): Promise<DiaryEntry | undefined> {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return await (window as any).electronAPI.getDiaryEntryById(id);
    } else {
      const response = await fetch(`/api/diary/${id}`);
      if (!response.ok) return undefined;
      return response.json();
    }
  },

  async create(entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<DiaryEntry> {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return await (window as any).electronAPI.createDiaryEntry(entry);
    } else {
      const response = await fetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      if (!response.ok) throw new Error('Failed to create diary entry');
      return response.json();
    }
  },

  async update(id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry | undefined> {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const result = await (window as any).electronAPI.updateDiaryEntry(id, updates);
      return result || undefined;
    } else {
      const response = await fetch(`/api/diary/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) return undefined;
      return response.json();
    }
  },

  async delete(id: string): Promise<boolean> {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return await (window as any).electronAPI.deleteDiaryEntry(id);
    } else {
      const response = await fetch(`/api/diary/${id}`, { method: 'DELETE' });
      return response.ok;
    }
  },

  async getByDate(date: string): Promise<DiaryEntry[]> {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return await (window as any).electronAPI.getDiaryEntriesByDate(date);
    } else {
      const response = await fetch(`/api/diary?date=${date}`);
      if (!response.ok) throw new Error('Failed to fetch diary entries by date');
      return response.json();
    }
  },

  async getByMood(mood: DiaryEntry['mood']): Promise<DiaryEntry[]> {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return await (window as any).electronAPI.getDiaryEntriesByMood(mood);
    } else {
      const response = await fetch(`/api/diary?mood=${mood}`);
      if (!response.ok) throw new Error('Failed to fetch diary entries by mood');
      return response.json();
    }
  },

  async searchEntries(query: string): Promise<DiaryEntry[]> {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      return await (window as any).electronAPI.searchDiaryEntries(query);
    } else {
      const response = await fetch(`/api/diary?search=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('Failed to search diary entries');
      return response.json();
    }
  },
};

export type { Task, DiaryEntry };
