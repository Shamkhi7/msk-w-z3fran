const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Optimize Chromium for high performance & smoothness on Windows 7 & 11
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');

let mainWindow = null;

// ==========================================
// Atomic Data Storage Engine (Crash-Proof)
// ==========================================
let dataDir;
let dbPath;
let backupPath;
let storeCache = {};

function initStorage() {
  try {
    dataDir = path.join(app.getPath('userData'), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    dbPath = path.join(dataDir, 'pos_database.json');
    backupPath = path.join(dataDir, 'pos_database.bak');

    // Attempt to load primary database
    if (fs.existsSync(dbPath)) {
      try {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        storeCache = JSON.parse(raw) || {};
        console.log('[Storage] Successfully loaded database from disk.');
      } catch (err) {
        console.error('[Storage] Primary database corrupt, attempting backup restore:', err);
        if (fs.existsSync(backupPath)) {
          const rawBak = fs.readFileSync(backupPath, 'utf-8');
          storeCache = JSON.parse(rawBak) || {};
          console.log('[Storage] Restored from backup database.');
        }
      }
    }
  } catch (e) {
    console.error('[Storage] Initialization error:', e);
  }
}

// Atomic file writer: writes to a temporary file first then renames atomically.
// Prevents corruption if the PC suddenly loses power or crashes mid-write.
function atomicWriteDatabase(data) {
  if (!dbPath) return;
  try {
    const tempPath = `${dbPath}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
    const serialized = JSON.stringify(data, null, 2);
    fs.writeFileSync(tempPath, serialized, 'utf-8');

    // Rotate backup if valid file already exists
    if (fs.existsSync(dbPath)) {
      try {
        fs.copyFileSync(dbPath, backupPath);
      } catch (e) {}
    }

    fs.renameSync(tempPath, dbPath);
  } catch (err) {
    console.error('[Storage] Atomic write failed:', err);
  }
}

// Debounced disk flusher for high-frequency writes
let saveTimer = null;
function scheduleDiskSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    atomicWriteDatabase(storeCache);
    saveTimer = null;
  }, 100);
}

// Force immediate flush before app quit
function flushImmediate() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  atomicWriteDatabase(storeCache);
}

// ==========================================
// Window Creation & Desktop Lifecycle
// ==========================================
function createWindow() {
  const iconPath = path.join(__dirname, '../public/logo.png');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'مسك وزعفران | نظام إدارة المبيعات ونقاط البيع',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#380208',
    focusable: true,
    show: false, // Show once ready to avoid white flicker
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      spellcheck: false,
    },
  });

  // Remove default menu for clean POS boutique interface
  Menu.setApplicationMenu(null);

  // Keyboard shortcut: F11 toggles Fullscreen
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && input.type === 'keyDown') {
      event.preventDefault();
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  // Notify renderer on fullscreen change
  mainWindow.on('enter-full-screen', () => {
    mainWindow?.webContents.send('window:fullscreen-changed', true);
  });
  mainWindow.on('leave-full-screen', () => {
    mainWindow?.webContents.send('window:fullscreen-changed', false);
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
    mainWindow.focus();
  });

  const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ==========================================
// IPC Communication Handlers
// ==========================================
function setupIPC() {
  // Save single key-value pair
  ipcMain.handle('disk:save-key', async (event, { key, value }) => {
    storeCache[key] = value;
    storeCache._lastUpdated = new Date().toISOString();
    scheduleDiskSave();
    return { success: true };
  });

  // Save multiple key-value pairs at once
  ipcMain.handle('disk:save-batch', async (event, batchObj) => {
    Object.assign(storeCache, batchObj);
    storeCache._lastUpdated = new Date().toISOString();
    scheduleDiskSave();
    return { success: true };
  });

  // Load complete cached database from disk
  ipcMain.handle('disk:load-all', async () => {
    return storeCache;
  });

  // Export full backup to user-selected file
  ipcMain.handle('disk:export-backup', async (event, dataToExport) => {
    const payload = dataToExport || storeCache;
    const defaultName = `musk_backup_${new Date().toISOString().slice(0, 10)}.json`;
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'تصدير نسخة احتياطية لمنظومة مسك وزعفران',
      defaultPath: defaultName,
      filters: [{ name: 'JSON Backup', extensions: ['json'] }],
    });

    if (canceled || !filePath) return { canceled: true };

    try {
      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
      return { success: true, filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Import backup from file
  ipcMain.handle('disk:import-backup', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'استيراد نسخة احتياطية',
      filters: [{ name: 'JSON Backup', extensions: ['json'] }],
      properties: ['openFile'],
    });

    if (canceled || !filePaths || filePaths.length === 0) return { canceled: true };

    try {
      const content = fs.readFileSync(filePaths[0], 'utf-8');
      const parsed = JSON.parse(content);
      // Immediately merge into memory & disk
      Object.assign(storeCache, parsed);
      flushImmediate();
      return { success: true, data: parsed };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // Window Controls
  ipcMain.handle('window:minimize', () => mainWindow?.minimize());
  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.handle('window:toggle-fullscreen', () => {
    if (mainWindow) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  // System metadata
  ipcMain.handle('system:get-info', () => ({
    isDesktop: true,
    platform: process.platform,
    version: app.getVersion(),
    userDataPath: app.getPath('userData'),
    dbPath,
  }));
}

// ==========================================
// Application Lifecycle
// ==========================================
app.whenReady().then(() => {
  initStorage();
  setupIPC();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Flush all data to disk safely before quitting
app.on('before-quit', () => {
  flushImmediate();
});

app.on('window-all-closed', () => {
  flushImmediate();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
