import api, { simulateDelay } from './api';
import { Staff } from '../types';
import { initialStaff } from '../data/staff';

const STAFF_KEY = 'guesthouse_staff_data';

const getStoredStaff = (): Staff[] => {
  const data = localStorage.getItem(STAFF_KEY);
  if (!data) {
    localStorage.setItem(STAFF_KEY, JSON.stringify(initialStaff));
    return initialStaff;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialStaff;
  }
};

export const staffService = {
  getAll: async (): Promise<Staff[]> => {
    try {
      const res = await api.get('/staff');
      if (res.data?.staff && Array.isArray(res.data.staff) && res.data.staff.length > 0) {
        localStorage.setItem(STAFF_KEY, JSON.stringify(res.data.staff));
        return res.data.staff;
      }
    } catch (err) {
      console.warn('Backend API /staff unreachable, using local fallback.', err);
    }
    return simulateDelay(getStoredStaff());
  },

  create: async (data: Omit<Staff, 'id'>): Promise<Staff> => {
    try {
      const res = await api.post('/staff', data);
      if (res.data?.staff) {
        const list = getStoredStaff();
        list.push(res.data.staff);
        localStorage.setItem(STAFF_KEY, JSON.stringify(list));
        return res.data.staff;
      }
    } catch (err) {
      console.warn('Backend API create staff failed, using local fallback.', err);
    }
    const list = getStoredStaff();
    const item: Staff = { ...data, id: `staff-${Date.now()}` };
    list.push(item);
    localStorage.setItem(STAFF_KEY, JSON.stringify(list));
    return simulateDelay(item);
  },

  update: async (id: string, updates: Partial<Staff>): Promise<Staff> => {
    try {
      await api.put(`/staff/${id}`, updates);
    } catch (err) {
      console.warn('Backend API update staff failed, using local fallback.', err);
    }
    const list = getStoredStaff();
    const index = list.findIndex(s => String(s.id) === String(id));
    if (index === -1) throw new Error('Staff not found');
    list[index] = { ...list[index], ...updates };
    localStorage.setItem(STAFF_KEY, JSON.stringify(list));
    return simulateDelay(list[index]);
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/staff/${id}`);
    } catch (err) {
      console.warn('Backend API delete staff failed, using local fallback.', err);
    }
    const list = getStoredStaff();
    const filtered = list.filter(s => String(s.id) !== String(id));
    localStorage.setItem(STAFF_KEY, JSON.stringify(filtered));
    return simulateDelay(true);
  },

  toggleStatus: async (id: string): Promise<Staff> => {
    try {
      const res = await api.patch(`/staff/${id}/toggle`);
      const list = getStoredStaff();
      const index = list.findIndex(s => String(s.id) === String(id));
      if (index !== -1 && res.data?.status) {
        list[index].status = res.data.status;
        localStorage.setItem(STAFF_KEY, JSON.stringify(list));
        return list[index];
      }
    } catch (err) {
      console.warn('Backend API toggle staff failed, using local fallback.', err);
    }
    const list = getStoredStaff();
    const index = list.findIndex(s => String(s.id) === String(id));
    if (index === -1) throw new Error('Staff not found');
    list[index].status = list[index].status === 'Active' ? 'Inactive' : 'Active';
    localStorage.setItem(STAFF_KEY, JSON.stringify(list));
    return simulateDelay(list[index]);
  }
};
