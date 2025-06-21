const { promises: fs } = require("fs");
const path = require("path");
const { app } = require("electron");

// Electron-specific JSON database that stores in user data directory
class JsonDB {
  constructor(fileName) {
    this.fileName = fileName;
    // Store in user's app data directory
    const userDataPath = app.getPath("userData");
    const dataDir = path.join(userDataPath, "data");
    this.filePath = path.join(dataDir, fileName);
  }

  async read() {
    try {
      const data = await fs.readFile(this.filePath, "utf8");
      return JSON.parse(data);
    } catch (err) {
      if (err.code === "ENOENT") {
        // File doesn't exist, return empty array
        return [];
      }
      throw err;
    }
  }

  async write(data) {
    const dataDir = path.dirname(this.filePath);
    // Ensure data directory exists
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async update(updater) {
    const data = await this.read();
    const updatedData = await updater(data);
    await this.write(updatedData);
  }
}

module.exports = { JsonDB };
