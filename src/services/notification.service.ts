import { simulateDelay } from './api';
import { Notification } from '../types';
import { initialNotifications } from '../data/notifications';

const NOTIFS_KEY = 'guesthouse_notifications_data';

const getStoredNotifs = (): Notification[] => {
  const data = localStorage.getItem(NOTIFS_KEY);
  if (!data) {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(initialNotifications));
    return initialNotifications;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialNotifications;
  }
};

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    return simulateDelay(getStoredNotifs());
  },

  markAsRead: async (id: string): Promise<Notification[]> => {
    const list = getStoredNotifs();
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index].read = true;
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(list));
    }
    return simulateDelay(list);
  },

  markAllAsRead: async (): Promise<Notification[]> => {
    const list = getStoredNotifs().map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(list));
    return simulateDelay(list);
  },

  add: async (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<Notification> => {
    const list = getStoredNotifs();
    const item: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false
    };
    list.unshift(item);
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(list));
    return simulateDelay(item);
  }
};
