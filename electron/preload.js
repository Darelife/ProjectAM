const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Task operations
  getTasks: () => ipcRenderer.invoke("tasks:getAll"),
  getTaskById: (id) => ipcRenderer.invoke("tasks:getById", id),
  createTask: (task) => ipcRenderer.invoke("tasks:create", task),
  updateTask: (id, updates) => ipcRenderer.invoke("tasks:update", id, updates),
  deleteTask: (id) => ipcRenderer.invoke("tasks:delete", id),
  getTasksByDate: (date) => ipcRenderer.invoke("tasks:getByDate", date),
  getTasksByQuadrant: (quadrant) =>
    ipcRenderer.invoke("tasks:getByQuadrant", quadrant),
  linkTaskToNote: (taskId, noteId) =>
    ipcRenderer.invoke("tasks:linkToNote", taskId, noteId),

  // Diary operations
  getDiaryEntries: () => ipcRenderer.invoke("diary:getAll"),
  getDiaryEntryById: (id) => ipcRenderer.invoke("diary:getById", id),
  createDiaryEntry: (entry) => ipcRenderer.invoke("diary:create", entry),
  updateDiaryEntry: (id, updates) =>
    ipcRenderer.invoke("diary:update", id, updates),
  deleteDiaryEntry: (id) => ipcRenderer.invoke("diary:delete", id),
  getDiaryEntriesByDate: (date) => ipcRenderer.invoke("diary:getByDate", date),
  getDiaryEntriesByMood: (mood) => ipcRenderer.invoke("diary:getByMood", mood),
  searchDiaryEntries: (query) => ipcRenderer.invoke("diary:search", query),

  // App operations
  getUserDataPath: () => ipcRenderer.invoke("app:getUserDataPath"),
  getPlatform: () => ipcRenderer.invoke("app:getPlatform"),

  // Environment check
  isElectron: true,
});

// Optional: Expose a limited API for development
if (process.env.NODE_ENV === "development") {
  contextBridge.exposeInMainWorld("electronDev", {
    openDevTools: () => ipcRenderer.invoke("dev:openDevTools"),
  });
}
