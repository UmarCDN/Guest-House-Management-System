import api, { simulateDelay } from './api';
import { SystemSettings } from '../types';
import { initialSettings } from '../data/settings';

const SETTINGS_KEY = 'guesthouse_settings_data';

const getStoredSettings = (): SystemSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  if (!data) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(initialSettings));
    return initialSettings;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialSettings;
  }
};

export const settingsService = {
  get: async (): Promise<SystemSettings> => {
    try {
      const res = await api.get('/settings');
      if (res.data?.settings) {
        const stored = getStoredSettings();
        const merged: SystemSettings = {
          general: { ...stored.general, ...(res.data.settings.general || {}) },
          booking: { ...stored.booking, ...(res.data.settings.booking || {}) },
          payment: { ...stored.payment, ...(res.data.settings.payment || {}) }
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('Backend API /settings unreachable, using local fallback.', err);
    }
    return simulateDelay(getStoredSettings());
  },

  update: async (updates: Partial<SystemSettings>): Promise<SystemSettings> => {
    try {
      await api.put('/settings', updates);
    } catch (err) {
      console.warn('Backend API update settings failed, using local fallback.', err);
    }
    const current = getStoredSettings();
    const merged: SystemSettings = {
      ...current,
      ...updates,
      general: { ...current.general, ...(updates.general || {}) },
      booking: { ...current.booking, ...(updates.booking || {}) },
      payment: { ...current.payment, ...(updates.payment || {}) }
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    return simulateDelay(merged);
  }
};
