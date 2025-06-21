const { JsonDB } = require("../lib/JsonDB");
const { v4: uuidv4 } = require("uuid");

class DiaryService {
  constructor() {
    this.db = new JsonDB("diary.json");
  }

  async getAll() {
    return await this.db.read();
  }

  async getById(id) {
    const entries = await this.db.read();
    return entries.find((entry) => entry.id === id);
  }

  async create(entryData) {
    const now = new Date().toISOString();
    const newEntry = {
      ...entryData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      tags: entryData.tags || [],
      linkedNoteIds: entryData.linkedNoteIds || [],
    };

    const entries = await this.db.read();
    entries.push(newEntry);
    await this.db.write(entries);
    return newEntry;
  }

  async update(id, updates) {
    const entries = await this.db.read();
    const index = entries.findIndex((entry) => entry.id === id);

    if (index === -1) return null;

    const updatedEntry = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    entries[index] = updatedEntry;
    await this.db.write(entries);
    return updatedEntry;
  }

  async delete(id) {
    const entries = await this.db.read();
    const filteredEntries = entries.filter((entry) => entry.id !== id);

    if (filteredEntries.length === entries.length) {
      return false; // Entry not found
    }

    await this.db.write(filteredEntries);
    return true;
  }

  async getByDate(date) {
    const entries = await this.db.read();
    return entries.filter((entry) => entry.date === date);
  }

  async getByMood(mood) {
    const entries = await this.db.read();
    return entries.filter((entry) => entry.mood === mood);
  }

  async searchEntries(query) {
    const entries = await this.db.read();
    const searchLower = query.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(searchLower) ||
        entry.content.toLowerCase().includes(searchLower) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(searchLower))
    );
  }
}

module.exports = { DiaryService };
