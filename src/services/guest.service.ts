import api, { simulateDelay } from './api';
import { Guest } from '../types';
import { initialGuests } from '../data/guests';

const GUESTS_KEY = 'guesthouse_guests_data';

const getStoredGuests = (): Guest[] => {
  const data = localStorage.getItem(GUESTS_KEY);
  if (!data) {
    localStorage.setItem(GUESTS_KEY, JSON.stringify(initialGuests));
    return initialGuests;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialGuests;
  }
};

export const guestService = {
  getAll: async (): Promise<Guest[]> => {
    try {
      const res = await api.get('/users/guests');
      if (res.data?.guests && Array.isArray(res.data.guests) && res.data.guests.length > 0) {
        const mapped = res.data.guests.map((g: any) => {
          const names = (g.name || 'Guest User').split(' ');
          return {
            id: String(g.id),
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
            email: g.email,
            phone: g.phone || '+92 300 0000000',
            cnicPassport: g.cnic || '42101-1234567-1',
            address: g.address || 'Default Residence',
            city: g.city || 'Islamabad',
            country: g.country || 'Pakistan',
            totalBookings: Number(g.total_bookings || 0),
            totalSpend: Number(g.total_spent || 0),
            lastVisit: g.created_at ? g.created_at.split('T')[0] : '2026-09-01',
            status: 'Active' as const,
            createdAt: g.created_at || new Date().toISOString()
          };
        });
        localStorage.setItem(GUESTS_KEY, JSON.stringify(mapped));
        return mapped;
      }
    } catch (err) {
      console.warn('Backend API /users/guests unreachable, using local fallback.', err);
    }
    return simulateDelay(getStoredGuests());
  },

  getById: async (id: string): Promise<Guest | undefined> => {
    const guests = await guestService.getAll();
    return guests.find((g) => String(g.id) === String(id));
  },

  create: async (guestData: Omit<Guest, 'id'>): Promise<Guest> => {
    try {
      const fullName = `${guestData.firstName} ${guestData.lastName}`.trim();
      const res = await api.post('/users/guests', {
        name: fullName,
        email: guestData.email,
        phone: guestData.phone
      });
      if (res.data?.guest) {
        const created: Guest = {
          ...guestData,
          id: String(res.data.guest.id)
        };
        const guests = getStoredGuests();
        guests.unshift(created);
        localStorage.setItem(GUESTS_KEY, JSON.stringify(guests));
        return created;
      }
    } catch (err: any) {
      console.warn('Backend API create guest failed, falling back to local.', err);
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
    }

    const guests = getStoredGuests();
    const newGuest: Guest = {
      ...guestData,
      id: `guest-${Date.now()}`
    };
    guests.unshift(newGuest);
    localStorage.setItem(GUESTS_KEY, JSON.stringify(guests));
    return simulateDelay(newGuest);
  },

  update: async (id: string, updates: Partial<Guest>): Promise<Guest> => {
    try {
      const fullName = updates.firstName || updates.lastName 
        ? `${updates.firstName || ''} ${updates.lastName || ''}`.trim()
        : undefined;
      await api.put(`/users/guests/${id}`, {
        name: fullName,
        phone: updates.phone
      });
    } catch (err) {
      console.warn('Backend API update guest failed, falling back to local.', err);
    }

    const guests = getStoredGuests();
    const index = guests.findIndex((g) => String(g.id) === String(id));
    if (index === -1) throw new Error(`Guest ${id} not found`);
    guests[index] = { ...guests[index], ...updates };
    localStorage.setItem(GUESTS_KEY, JSON.stringify(guests));
    return simulateDelay(guests[index]);
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/users/guests/${id}`);
    } catch (err) {
      console.warn('Backend API delete guest failed, falling back to local.', err);
    }

    const guests = getStoredGuests();
    const filtered = guests.filter((g) => String(g.id) !== String(id));
    localStorage.setItem(GUESTS_KEY, JSON.stringify(filtered));
    return simulateDelay(true);
  }
};
