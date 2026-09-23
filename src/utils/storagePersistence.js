/**
 * Storage Persistence Utility for Meska & Zafran POS
 * Requests browser persistent storage permission and monitors local storage quota
 * to prevent eviction during system cleanup or low-disk conditions.
 */

export async function requestPersistentStorage() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isAlreadyPersisted = await navigator.storage.persisted();
      if (!isAlreadyPersisted) {
        const isPersisted = await navigator.storage.persist();
        console.log(`[Meska & Zafran Storage] Persistent storage permission granted: ${isPersisted}`);
        return isPersisted;
      }
      console.log('[Meska & Zafran Storage] Storage is already persistent.');
      return true;
    } catch (err) {
      console.warn('[Meska & Zafran Storage] Error requesting persistent storage:', err);
    }
  }
  return false;
}

export async function getStorageEstimate() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const { quota, usage } = await navigator.storage.estimate();
      return {
        quotaMB: Math.round(quota / (1024 * 1024)),
        usageMB: (usage / (1024 * 1024)).toFixed(2),
        percentUsed: ((usage / quota) * 100).toFixed(2),
      };
    } catch (e) {
      console.warn('[Meska & Zafran Storage] Error getting storage estimate:', e);
    }
  }
  return null;
}

/**
 * Rehydrates local storage from the atomic disk database if running in Desktop mode
 * and ensures any existing localStorage state is mirrored to disk.
 */
export async function initDesktopStorageSync() {
  if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.loadAllFromDisk === 'function') {
    try {
      const diskData = await window.electronAPI.loadAllFromDisk();
      if (diskData && typeof diskData === 'object') {
        let restoredCount = 0;
        Object.entries(diskData).forEach(([key, val]) => {
          if (key.startsWith('mz_') && (!window.localStorage.getItem(key) || window.localStorage.getItem(key) === 'null')) {
            window.localStorage.setItem(key, JSON.stringify(val));
            restoredCount++;
          }
        });
        if (restoredCount > 0) {
          console.log(`[Storage Bridge] Rehydrated ${restoredCount} keys from atomic disk backup.`);
        }
      }

      // Initial mirror: send all existing localStorage keys to disk
      const batch = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && k.startsWith('mz_')) {
          try {
            batch[k] = JSON.parse(window.localStorage.getItem(k));
          } catch (e) {}
        }
      }
      if (Object.keys(batch).length > 0 && typeof window.electronAPI.saveBatchToDisk === 'function') {
        await window.electronAPI.saveBatchToDisk(batch);
      }
    } catch (err) {
      console.warn('[Storage Bridge] Error syncing desktop storage:', err);
    }
  }
}

/**
 * Universal Backup Export (Works on both Website and Desktop App)
 */
export async function exportFullPOSBackup() {
  try {
    const backupData = {
      app: 'Meska & Zafran POS',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      keys: {},
    };

    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && (key.startsWith('mz_') || key === 'pos_store_settings')) {
        try {
          backupData.keys[key] = JSON.parse(window.localStorage.getItem(key));
        } catch (e) {
          backupData.keys[key] = window.localStorage.getItem(key);
        }
      }
    }

    // In Desktop App: use native save dialog
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.exportBackup === 'function') {
      const result = await window.electronAPI.exportBackup(backupData);
      return result;
    }

    // In Web Browser: create virtual download link
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `musk_pos_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true, webDownload: true };
  } catch (err) {
    console.error('Backup export failed:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Universal Backup Import (Restores data safely and reloads)
 */
export async function importFullPOSBackup(importedJson) {
  try {
    let data = importedJson;
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }

    if (!data || !data.keys || typeof data.keys !== 'object') {
      throw new Error('الملف غير صالح أو لا يحتوي على بنية بيانات صحيحة');
    }

    // Apply all keys to localStorage
    Object.entries(data.keys).forEach(([k, v]) => {
      window.localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
    });

    // Mirror to desktop if in electron
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.saveBatchToDisk === 'function') {
      await window.electronAPI.saveBatchToDisk(data.keys);
    }

    return { success: true, restoredKeysCount: Object.keys(data.keys).length };
  } catch (err) {
    console.error('Backup import failed:', err);
    return { success: false, error: err.message };
  }
}

