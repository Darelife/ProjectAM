import { promises as fs } from 'fs';
import path from 'path';

// Server-only JSON database
export class JsonDB<T> {
  private fileName: string;
  private filePath: string;

  constructor(fileName: string) {
    this.fileName = fileName;
    this.filePath = path.join(process.cwd(), 'data', fileName);
  }

  async read(): Promise<T[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        // File doesn't exist, return empty array
        return [];
      }
      throw err;
    }
  }

  async write(data: T[]): Promise<void> {
    const dataDir = path.dirname(this.filePath);
    // Ensure data directory exists
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async update(updater: (data: T[]) => Promise<T[]>): Promise<void> {
    const data = await this.read();
    const updatedData = await updater(data);
    await this.write(updatedData);
  }
}

// Example: export async functions that use JsonDB
export async function readJsonDB<T>(fileName: string): Promise<T[]> {
  const db = new JsonDB<T>(fileName);
  return db.read();
}

export async function writeJsonDB<T>(fileName: string, data: T[]): Promise<void> {
  const db = new JsonDB<T>(fileName);
  await db.write(data);
}

export async function updateJsonDB<T>(fileName: string, updater: (data: T[]) => Promise<T[]>): Promise<void> {
  const db = new JsonDB<T>(fileName);
  await db.update(updater);
}
