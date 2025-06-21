// Electron renderer DiaryService that uses IPC to communicate with main process
import { DiaryEntry } from '../types/DiaryEntry';

// Type assertion for electronAPI
declare const window: Window & {
  electronAPI: {
    getDiaryEntries: () => Promise<DiaryEntry[]>;
    getDiaryEntryById: (id: string) => Promise<DiaryEntry | undefined>;
    createDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<DiaryEntry>;
    updateDiaryEntry: (id: string, updates: Partial<DiaryEntry>) => Promise<DiaryEntry | null>;
    deleteDiaryEntry: (id: string) => Promise<boolean>;
    getDiaryEntriesByDate: (date: string) => Promise<DiaryEntry[]>;
    getDiaryEntriesByMood: (mood: DiaryEntry['mood']) => Promise<DiaryEntry[]>;
    searchDiaryEntries: (query: string) => Promise<DiaryEntry[]>;
    isElectron: boolean;
  };
};

export const DiaryService = {
  async getAll(): Promise<DiaryEntry[]> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.getDiaryEntries();
    }
    throw new Error('DiaryService.electron: Not running in Electron environment');
  },

  async getById(id: string): Promise<DiaryEntry | undefined> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.getDiaryEntryById(id);
    }
    throw new Error('DiaryService.electron: Not running in Electron environment');
  },

  async create(entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<DiaryEntry> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.createDiaryEntry(entry);
    }
    throw new Error('DiaryService.electron: Not running in Electron environment');
  },

  async update(id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry | undefined> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const result = await window.electronAPI.updateDiaryEntry(id, updates);
      return result || undefined;
    }
    throw new Error('DiaryService.electron: Not running in Electron environment');
  },

  async delete(id: string): Promise<boolean> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.deleteDiaryEntry(id);
    }
    throw new Error('DiaryService.electron: Not running in Electron environment');
  },

  async getByDate(date: string): Promise<DiaryEntry[]> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.getDiaryEntriesByDate(date);
    }
    throw new Error('DiaryService.electron: Not running in Electron environment');
  },

  async getByMood(mood: DiaryEntry['mood']): Promise<DiaryEntry[]> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.getDiaryEntriesByMood(mood);
    }
    throw new Error('DiaryService.electron: Not running in Electron environment');
  },

  async searchEntries(query: string): Promise<DiaryEntry[]> {
    if (typeof window !== 'undefined' && window.electronAPI) {
      return await window.electronAPI.searchDiaryEntries(query);
    }
    throw new Error('DiaryService.electron: Not running in Electron environment');
  },
};
