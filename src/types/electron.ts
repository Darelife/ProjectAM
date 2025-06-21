import { Task } from './Task';
import { DiaryEntry } from './DiaryEntry';

declare global {
  interface Window {
    electronAPI: {
      // Task operations
      getTasks: () => Promise<Task[]>;
      getTaskById: (id: string) => Promise<Task | undefined>;
      createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
      updateTask: (id: string, updates: Partial<Task>) => Promise<Task | null>;
      deleteTask: (id: string) => Promise<boolean>;
      getTasksByDate: (date: string) => Promise<Task[]>;
      getTasksByQuadrant: (quadrant: Task['eisenhowerQuadrant']) => Promise<Task[]>;
      linkTaskToNote: (taskId: string, noteId: string) => Promise<Task | undefined>;
      
      // Diary operations
      getDiaryEntries: () => Promise<DiaryEntry[]>;
      getDiaryEntryById: (id: string) => Promise<DiaryEntry | undefined>;
      createDiaryEntry: (entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<DiaryEntry>;
      updateDiaryEntry: (id: string, updates: Partial<DiaryEntry>) => Promise<DiaryEntry | null>;
      deleteDiaryEntry: (id: string) => Promise<boolean>;
      getDiaryEntriesByDate: (date: string) => Promise<DiaryEntry[]>;
      getDiaryEntriesByMood: (mood: DiaryEntry['mood']) => Promise<DiaryEntry[]>;
      searchDiaryEntries: (query: string) => Promise<DiaryEntry[]>;
      
      // App operations
      getUserDataPath: () => Promise<string>;
      getPlatform: () => Promise<string>;
      
      // Environment check
      isElectron: boolean;
    };
  }
}
