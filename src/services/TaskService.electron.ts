// Electron renderer TaskService that uses IPC to communicate with main process
import { Task } from '../types/Task';

// Type assertion for electronAPI
declare const window: Window & {
  electronAPI: {
    getTasks: () => Promise<Task[]>;
    getTaskById: (id: string) => Promise<Task | undefined>;
    createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<Task | null>;
    deleteTask: (id: string) => Promise<boolean>;
    getTasksByDate: (date: string) => Promise<Task[]>;
    getTasksByQuadrant: (quadrant: Task['eisenhowerQuadrant']) => Promise<Task[]>;
    linkTaskToNote: (taskId: string, noteId: string) => Promise<Task | undefined>;
    isElectron: boolean;
  };
};

// Electron-specific task service that uses IPC
export const TaskService = {
  async getAll(): Promise<Task[]> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.getTasks();
    }
    // Fallback for non-electron environment
    throw new Error('Electron API not available');
  },

  async getById(id: string): Promise<Task | undefined> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.getTaskById(id);
    }
    // Fallback: get all tasks and filter
    const tasks = await this.getAll();
    return tasks.find(t => t.id === id);
  },

  async create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.createTask(task);
    }
    throw new Error('Electron API not available');
  },

  async update(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.updateTask(id, updates);
      return result || undefined;
    }
    throw new Error('TaskService.electron: Not running in Electron environment');
  },

  async delete(id: string): Promise<boolean> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.deleteTask(id);
    }
    throw new Error('Electron API not available');
  },

  async getByDate(date: string): Promise<Task[]> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.getTasksByDate(date);
    }
    throw new Error('Electron API not available');
  },

  async getByQuadrant(quadrant: Task['eisenhowerQuadrant']): Promise<Task[]> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.getTasksByQuadrant(quadrant);
    }
    throw new Error('Electron API not available');
  },

  async linkToNote(taskId: string, noteId: string): Promise<Task | undefined> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.linkTaskToNote(taskId, noteId);
    }
    throw new Error('Electron API not available');
  },
};
