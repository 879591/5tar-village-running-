/**
 * Local Storage Manager
 * Saves best score, accumulated coins, and user settings locally without requiring backend or login.
 */

import { GAME_CONFIG } from '../config/gameConfig';

export interface UserSettings {
  musicEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  musicEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
};

export const StorageManager = {
  getBestScore(): number {
    try {
      const raw = localStorage.getItem(GAME_CONFIG.storageKeys.bestScore);
      if (!raw) return 0;
      const parsed = parseInt(raw, 10);
      return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    } catch {
      return 0;
    }
  },

  setBestScore(score: number): boolean {
    try {
      const current = this.getBestScore();
      if (score > current) {
        localStorage.setItem(GAME_CONFIG.storageKeys.bestScore, Math.floor(score).toString());
        return true; // New record!
      }
      return false;
    } catch {
      return false;
    }
  },

  getTotalCoins(): number {
    try {
      const raw = localStorage.getItem(GAME_CONFIG.storageKeys.totalCoins);
      if (!raw) return 0;
      const parsed = parseInt(raw, 10);
      return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    } catch {
      return 0;
    }
  },

  addCoins(amount: number): number {
    try {
      const next = this.getTotalCoins() + Math.max(0, Math.floor(amount));
      localStorage.setItem(GAME_CONFIG.storageKeys.totalCoins, next.toString());
      return next;
    } catch {
      return 0;
    }
  },

  getSettings(): UserSettings {
    try {
      const raw = localStorage.getItem(GAME_CONFIG.storageKeys.settings);
      if (!raw) return { ...DEFAULT_SETTINGS };
      const parsed = JSON.parse(raw);
      return {
        musicEnabled: typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : DEFAULT_SETTINGS.musicEnabled,
        soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
        vibrationEnabled: typeof parsed.vibrationEnabled === 'boolean' ? parsed.vibrationEnabled : DEFAULT_SETTINGS.vibrationEnabled,
      };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(GAME_CONFIG.storageKeys.settings, JSON.stringify(settings));
    } catch {
      // Ignore storage quota / privacy mode errors gracefully
    }
  },
};
