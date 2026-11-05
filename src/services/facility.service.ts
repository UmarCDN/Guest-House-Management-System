import api, { simulateDelay } from './api';
import { Facility } from '../types';
import { initialFacilities } from '../data/facilities';

const FACILITIES_KEY = 'guesthouse_facilities_data';

const mapBackendFacility = (f: any): Facility => ({
  id: String(f.id),
  name: f.name,
  icon: f.icon || 'bi-star',
  description: f.description || '',
  status: f.status === 'Disabled' ? 'Disabled' : 'Enabled',
  category: f.category || 'General'
});

const getStoredFacilities = (): Facility[] => {
  const data = localStorage.getItem(FACILITIES_KEY);
  if (!data) {
    localStorage.setItem(FACILITIES_KEY, JSON.stringify(initialFacilities));
    return initialFacilities;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialFacilities;
  }
};

export const facilityService = {
  getAll: async (): Promise<Facility[]> => {
    try {
      const res = await api.get('/facilities');
      if (res.data?.facilities && Array.isArray(res.data.facilities) && res.data.facilities.length > 0) {
        const list = res.data.facilities.map(mapBackendFacility);
        localStorage.setItem(FACILITIES_KEY, JSON.stringify(list));
        return list;
      }
    } catch (err) {
      console.warn('Backend API /facilities unreachable, using local fallback.', err);
    }
    return simulateDelay(getStoredFacilities());
  },

  create: async (data: Omit<Facility, 'id'>): Promise<Facility> => {
    try {
      const res = await api.post('/facilities', {
        name: data.name,
        icon: data.icon,
        description: data.description,
        status: data.status
      });
      if (res.data?.facility) {
        const item = mapBackendFacility(res.data.facility);
        const list = getStoredFacilities();
        list.push(item);
        localStorage.setItem(FACILITIES_KEY, JSON.stringify(list));
        return item;
      }
    } catch (err) {
      console.warn('Backend API create facility failed, using local fallback.', err);
    }
    const list = getStoredFacilities();
    const item: Facility = { ...data, id: `fac-${Date.now()}` };
    list.push(item);
    localStorage.setItem(FACILITIES_KEY, JSON.stringify(list));
    return simulateDelay(item);
  },

  update: async (id: string, updates: Partial<Facility>): Promise<Facility> => {
    try {
      await api.put(`/facilities/${id}`, updates);
    } catch (err) {
      console.warn('Backend API update facility failed, using local fallback.', err);
    }
    const list = getStoredFacilities();
    const index = list.findIndex(f => String(f.id) === String(id));
    if (index === -1) throw new Error('Facility not found');
    list[index] = { ...list[index], ...updates };
    localStorage.setItem(FACILITIES_KEY, JSON.stringify(list));
    return simulateDelay(list[index]);
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/facilities/${id}`);
    } catch (err) {
      console.warn('Backend API delete facility failed, using local fallback.', err);
    }
    const list = getStoredFacilities();
    const filtered = list.filter(f => String(f.id) !== String(id));
    localStorage.setItem(FACILITIES_KEY, JSON.stringify(filtered));
    return simulateDelay(true);
  },

  toggleStatus: async (id: string): Promise<Facility> => {
    try {
      const res = await api.patch(`/facilities/${id}/toggle`);
      const list = getStoredFacilities();
      const index = list.findIndex(f => String(f.id) === String(id));
      if (index !== -1 && res.data?.status) {
        list[index].status = res.data.status;
        localStorage.setItem(FACILITIES_KEY, JSON.stringify(list));
        return list[index];
      }
    } catch (err) {
      console.warn('Backend API toggle facility failed, using local fallback.', err);
    }
    const list = getStoredFacilities();
    const index = list.findIndex(f => String(f.id) === String(id));
    if (index === -1) throw new Error('Facility not found');
    list[index].status = list[index].status === 'Enabled' ? 'Disabled' : 'Enabled';
    localStorage.setItem(FACILITIES_KEY, JSON.stringify(list));
    return simulateDelay(list[index]);
  }
};
