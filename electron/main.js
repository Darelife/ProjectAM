const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";

// Import our services
const { TaskService } = require("./services/TaskService");
const { DiaryService } = require("./services/DiaryService");
const taskService = new TaskService();
const diaryService = new DiaryService();

// IPC Handlers for tasks
ipcMain.handle("tasks:getAll", async () => {
  try {
    return await taskService.getAll();
  } catch (error) {
    console.error("Error getting all tasks:", error);
    throw error;
  }
});

ipcMain.handle("tasks:getById", async (event, id) => {
  try {
    return await taskService.getById(id);
  } catch (error) {
    console.error("Error getting task by id:", error);
    throw error;
  }
});

ipcMain.handle("tasks:create", async (event, taskData) => {
  try {
    return await taskService.create(taskData);
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
});

ipcMain.handle("tasks:update", async (event, id, updates) => {
  try {
    return await taskService.update(id, updates);
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
});

ipcMain.handle("tasks:delete", async (event, id) => {
  try {
    return await taskService.delete(id);
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
});

ipcMain.handle("tasks:getByDate", async (event, date) => {
  try {
    return await taskService.getByDate(date);
  } catch (error) {
    console.error("Error getting tasks by date:", error);
    throw error;
  }
});

ipcMain.handle("tasks:getByQuadrant", async (event, quadrant) => {
  try {
    return await taskService.getByQuadrant(quadrant);
  } catch (error) {
    console.error("Error getting tasks by quadrant:", error);
    throw error;
  }
});

ipcMain.handle("tasks:linkToNote", async (event, taskId, noteId) => {
  try {
    return await taskService.linkToNote(taskId, noteId);
  } catch (error) {
    console.error("Error linking task to note:", error);
    throw error;
  }
});

// IPC Handlers for diary
ipcMain.handle("diary:getAll", async () => {
  try {
    return await diaryService.getAll();
  } catch (error) {
    console.error("Error getting all diary entries:", error);
    throw error;
  }
});

ipcMain.handle("diary:getById", async (event, id) => {
  try {
    return await diaryService.getById(id);
  } catch (error) {
    console.error("Error getting diary entry by id:", error);
    throw error;
  }
});

ipcMain.handle("diary:create", async (event, entryData) => {
  try {
    return await diaryService.create(entryData);
  } catch (error) {
    console.error("Error creating diary entry:", error);
    throw error;
  }
});

ipcMain.handle("diary:update", async (event, id, updates) => {
  try {
    return await diaryService.update(id, updates);
  } catch (error) {
    console.error("Error updating diary entry:", error);
    throw error;
  }
});

ipcMain.handle("diary:delete", async (event, id) => {
  try {
    return await diaryService.delete(id);
  } catch (error) {
    console.error("Error deleting diary entry:", error);
    throw error;
  }
});

ipcMain.handle("diary:getByDate", async (event, date) => {
  try {
    return await diaryService.getByDate(date);
  } catch (error) {
    console.error("Error getting diary entries by date:", error);
    throw error;
  }
});

ipcMain.handle("diary:getByMood", async (event, mood) => {
  try {
    return await diaryService.getByMood(mood);
  } catch (error) {
    console.error("Error getting diary entries by mood:", error);
    throw error;
  }
});

ipcMain.handle("diary:search", async (event, query) => {
  try {
    return await diaryService.searchEntries(query);
  } catch (error) {
    console.error("Error searching diary entries:", error);
    throw error;
  }
});

ipcMain.handle("app:getUserDataPath", async () => {
  return app.getPath("userData");
});

ipcMain.handle("app:getPlatform", async () => {
  return process.platform;
});

async function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
    titleBarStyle: "default",
    show: false,
  });

  // Show window when ready to prevent visual flash
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  if (isDev) {
    // Try localhost:3000 first, then 3001 if 3000 is occupied
    try {
      await mainWindow.loadURL("http://localhost:3000");
    } catch (error) {
      console.log("Port 3000 not available, trying 3001...");
      await mainWindow.loadURL("http://localhost:3001");
    }
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"));
  }

  // Handle window closed
  mainWindow.on("closed", () => {
    // Dereference the window object
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  await createWindow();

  app.on("activate", async () => {
    // On macOS, re-create a window when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
  });
});
