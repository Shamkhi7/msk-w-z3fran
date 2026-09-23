const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,

  // Atomic Disk Storage
  saveToDisk: (key, value) => ipcRenderer.invoke('disk:save-key', { key, value }),
  saveBatchToDisk: (batchObj) => ipcRenderer.invoke('disk:save-batch', batchObj),
  loadAllFromDisk: () => ipcRenderer.invoke('disk:load-all'),

  // Backup & Restore
  exportBackup: (data) => ipcRenderer.invoke('disk:export-backup', data),
  importBackup: () => ipcRenderer.invoke('disk:import-backup'),

  // Window Controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  toggleFullscreen: () => ipcRenderer.invoke('window:toggle-fullscreen'),
  onFullscreenChange: (callback) => {
    const handler = (event, isFs) => callback(isFs);
    ipcRenderer.on('window:fullscreen-changed', handler);
    return () => ipcRenderer.removeListener('window:fullscreen-changed', handler);
  },

  // Diagnostics & System Info
  getSystemInfo: () => ipcRenderer.invoke('system:get-info'),
});
