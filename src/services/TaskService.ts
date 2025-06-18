import { JsonDB } from '../lib/jsonDB';
import { Task, TaskSchema } from '../types/Task';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const db = new JsonDB<Task>('tasks.json');

export const TaskService = {
  async getAll(): Promise<Task[]> {
    return await db.read();
  },
  async getById(id: string): Promise<Task | undefined> {
    const tasks = await db.read();
    return tasks.find(t => t.id === id);
  },
  async create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      completed: false,
      linkedNoteIds: task.linkedNoteIds || [],
      tags: task.tags || [],
    };
    TaskSchema.parse(newTask);
    const tasks = await db.read();
    tasks.push(newTask);
    await db.write(tasks);
    return newTask;
  },
  async update(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const tasks = await db.read();
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return undefined;
    const updated = { ...tasks[idx], ...updates, updatedAt: new Date().toISOString() };
    TaskSchema.parse(updated);
    tasks[idx] = updated;
    await db.write(tasks);
    return updated;
  },
  async delete(id: string): Promise<boolean> {
    const tasks = await db.read();
    const filtered = tasks.filter(t => t.id !== id);
    await db.write(filtered);
    return filtered.length < tasks.length;
  },
  async getByDate(date: string): Promise<Task[]> {
    const tasks = await db.read();
    return tasks.filter(t => t.calendarDate === date);
  },
  async getByQuadrant(quadrant: Task['eisenhowerQuadrant']): Promise<Task[]> {
    const tasks = await db.read();
    return tasks.filter(t => t.eisenhowerQuadrant === quadrant);
  },
  async linkToNote(taskId: string, noteId: string): Promise<Task | undefined> {
    const tasks = await db.read();
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx === -1) return undefined;
    const task = tasks[idx];
    if (!task.linkedNoteIds.includes(noteId)) {
      task.linkedNoteIds.push(noteId);
      task.updatedAt = new Date().toISOString();
      TaskSchema.parse(task);
      tasks[idx] = task;
      await db.write(tasks);
    }
    return task;
  },
}; 