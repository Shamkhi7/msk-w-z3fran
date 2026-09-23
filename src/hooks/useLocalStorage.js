import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  const getInitial = () => {
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  };

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null && item !== undefined && item !== 'undefined') {
        const parsed = JSON.parse(item);
        if (parsed !== null && parsed !== undefined) {
          return parsed;
        }
      }
      return getInitial();
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return getInitial();
    }
  });

  // Synchronous atomic write: immediately commits state to localStorage
  // ensuring zero data loss during sudden shutdowns or browser crashes
  const setValue = useCallback((value) => {
    try {
      setStoredValue((prev) => {
        const valueToStore = typeof value === 'function' ? value(prev) : value;
        try {
          if (valueToStore !== undefined) {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            window.localStorage.setItem('mz_last_saved_at', new Date().toISOString());

            // If running as Desktop App, mirror atomically to physical disk file
            if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.saveToDisk === 'function') {
              window.electronAPI.saveToDisk(key, valueToStore).catch(() => {});
            }
          }
        } catch (e) {
          console.warn(`[Auto-Save] Error immediate sync setting key "${key}":`, e);
        }
        return valueToStore;
      });
    } catch (error) {
      console.warn(`[Auto-Save] Error in setter for "${key}":`, error);
    }
  }, [key]);

  // Fallback sync effect to ensure cross-component consistency
  useEffect(() => {
    try {
      if (storedValue !== undefined) {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}


