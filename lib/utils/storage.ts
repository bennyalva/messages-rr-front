'use client';

/**
 * Reusable localStorage utility — type-safe, SSR-safe, prefixed keys.
 * 
 * All keys are prefixed with `sonidero_` to avoid collisions with
 * other apps on the same domain.
 * 
 * Usage:
 *   storageService.setItem('config', { appName: 'Mi App' });
 *   const config = storageService.getItem<AppConfig>('config', defaultConfig);
 *   storageService.removeItem('config');
 */

const PREFIX = 'cabinaDigitalRR_';

function prefixKey(key: string): string {
  return `${PREFIX}${key}`;
}

function isClient(): boolean {
  return typeof window !== 'undefined';
}

export const storageService = {
  /**
   * Save a value to localStorage.
   * Serializes objects/arrays with JSON.stringify.
   */
  setItem<T>(key: string, value: T): void {
    if (!isClient()) return;

    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(prefixKey(key), serialized);
    } catch (error) {
      console.error(`[storageService] Error saving key "${key}":`, error);
    }
  },

  /**
   * Get a value from localStorage.
   * Returns `fallback` if the key doesn't exist or the data is corrupted.
   */
  getItem<T>(key: string, fallback?: T): T | null {
    if (!isClient()) return fallback ?? null;

    try {
      const raw = localStorage.getItem(prefixKey(key));
      if (raw === null) return fallback ?? null;

      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(`[storageService] Error reading key "${key}":`, error);
      return fallback ?? null;
    }
  },

  /**
   * Remove a specific key from localStorage.
   */
  removeItem(key: string): void {
    if (!isClient()) return;

    try {
      localStorage.removeItem(prefixKey(key));
    } catch (error) {
      console.error(`[storageService] Error removing key "${key}":`, error);
    }
  },
};
