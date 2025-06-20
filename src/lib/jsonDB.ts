// Client-only JSON database using localStorage
export class JsonDB<T> {
  private storageKey: string;

  constructor(fileName: string) {
    this.storageKey = `projectam_${fileName.replace('.json', '')}`;
  }

  async read(): Promise<T[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Failed to read from localStorage:', err);
      return [];
    }
  }

  async write(data: T[]): Promise<void> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to write to localStorage:', err);
      throw new Error('Failed to write to storage: ' + err);
    }
  }
}