const { JsonDB } = require("../lib/JsonDB");
const { v4: uuidv4 } = require("uuid");

class TaskService {
  constructor() {
    this.db = new JsonDB("tasks.json");
  }

  async getAll() {
    return await this.db.read();
  }

  async getById(id) {
    const tasks = await this.db.read();
    return tasks.find((t) => t.id === id);
  }

  async create(taskData) {
    const now = new Date().toISOString();
    const newTask = {
      ...taskData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      completed: taskData.completed || false,
      linkedNoteIds: taskData.linkedNoteIds || [],
      tags: taskData.tags || [],
    };

    const tasks = await this.db.read();
    tasks.push(newTask);
    await this.db.write(tasks);
    return newTask;
  }

  async update(id, updates) {
    const tasks = await this.db.read();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return undefined;

    const updated = {
      ...tasks[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    tasks[idx] = updated;
    await this.db.write(tasks);
    return updated;
  }

  async delete(id) {
    const tasks = await this.db.read();
    const filtered = tasks.filter((t) => t.id !== id);
    await this.db.write(filtered);
    return filtered.length < tasks.length;
  }

  async getByDate(date) {
    const tasks = await this.db.read();
    return tasks.filter((t) => t.calendarDate === date);
  }

  async getByQuadrant(quadrant) {
    const tasks = await this.db.read();
    return tasks.filter((t) => t.eisenhowerQuadrant === quadrant);
  }

  async linkToNote(taskId, noteId) {
    const tasks = await this.db.read();
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx === -1) return undefined;

    const task = tasks[idx];
    if (!task.linkedNoteIds.includes(noteId)) {
      task.linkedNoteIds.push(noteId);
      task.updatedAt = new Date().toISOString();
      tasks[idx] = task;
      await this.db.write(tasks);
    }
    return task;
  }
}

module.exports = { TaskService };
