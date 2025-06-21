import { JsonDB } from '../lib/jsonDB.server';
import { DiaryEntry, DiaryEntrySchema } from '../types/DiaryEntry';
import { v4 as uuidv4 } from 'uuid';

const db = new JsonDB<DiaryEntry>('diary.json');

export const DiaryService = {
  async getAll(): Promise<DiaryEntry[]> {
    return await db.read();
  },

  async getById(id: string): Promise<DiaryEntry | undefined> {
    const entries = await db.read();
    return entries.find(entry => entry.id === id);
  },

  async create(entry: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<DiaryEntry> {
    const now = new Date().toISOString();
    const newEntry: DiaryEntry = {
      ...entry,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      tags: entry.tags || [],
      linkedNoteIds: entry.linkedNoteIds || [],
    };

    DiaryEntrySchema.parse(newEntry);
    const entries = await db.read();
    entries.push(newEntry);
    await db.write(entries);
    return newEntry;
  },

  async update(id: string, updates: Partial<DiaryEntry>): Promise<DiaryEntry | undefined> {
    const entries = await db.read();
    const index = entries.findIndex(entry => entry.id === id);
    
    if (index === -1) return undefined;
    
    const updatedEntry = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    DiaryEntrySchema.parse(updatedEntry);
    entries[index] = updatedEntry;
    await db.write(entries);
    return updatedEntry;
  },

  async delete(id: string): Promise<boolean> {
    const entries = await db.read();
    const filteredEntries = entries.filter(entry => entry.id !== id);
    
    if (filteredEntries.length === entries.length) {
      return false; // Entry not found
    }
    
    await db.write(filteredEntries);
    return true;
  },

  async getByDate(date: string): Promise<DiaryEntry[]> {
    const entries = await db.read();
    return entries.filter(entry => entry.date === date);
  },

  async getByMood(mood: DiaryEntry['mood']): Promise<DiaryEntry[]> {
    const entries = await db.read();
    return entries.filter(entry => entry.mood === mood);
  },

  async searchEntries(query: string): Promise<DiaryEntry[]> {
    const entries = await db.read();
    const searchLower = query.toLowerCase();
    return entries.filter(entry => 
      entry.title.toLowerCase().includes(searchLower) ||
      entry.content.toLowerCase().includes(searchLower) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  },
};
