import api, { simulateDelay } from './api';
import { Room, RoomType } from '../types';
import { initialRooms } from '../data/rooms';
import { initialRoomTypes } from '../data/roomTypes';

const ROOMS_KEY = 'guesthouse_rooms_data';
const ROOM_TYPES_KEY = 'guesthouse_room_types_data';

const mapBackendRoom = (r: any): Room => {
  const images = Array.isArray(r.images) && r.images.length > 0 ? r.images : [r.primary_image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1000'];
  return {
    id: String(r.id),
    roomNumber: r.room_number || String(r.id),
    name: r.name,
    type: r.room_type_name || 'Deluxe',
    floor: Math.floor(parseInt(r.room_number || '100', 10) / 100) || 1,
    roomSize: r.size_sqm ? Math.round(r.size_sqm * 10.764) : 450,
    bedType: r.bed_type || 'King Bed',
    maxAdults: r.capacity || 2,
    maxChildren: 1,
    pricePerNight: typeof r.price_per_night === 'number' ? r.price_per_night : parseFloat(r.price_per_night || '100'),
    discount: 0,
    description: r.description || '',
    amenities: Array.isArray(r.amenities) ? r.amenities : [],
    images,
    status: r.status === 'maintenance' ? 'Maintenance' : (r.is_reserved || r.status === 'occupied') ? 'Occupied' : 'Available',
    isFeatured: true,
    isReserved: Boolean(r.is_reserved),
    activeBooking: r.active_booking ? {
      guestName: r.active_booking.guest_name,
      checkIn: r.active_booking.check_in_date,
      checkOut: r.active_booking.check_out_date,
      bookingReference: r.active_booking.booking_reference,
      status: r.active_booking.status
    } : undefined,
    rating: typeof r.rating === 'number' ? r.rating : parseFloat(r.rating || '5.0'),
    reviewCount: r.reviews_count || 0
  };
};

const getStoredRooms = (): Room[] => {
  const data = localStorage.getItem(ROOMS_KEY);
  if (!data) {
    localStorage.setItem(ROOMS_KEY, JSON.stringify(initialRooms));
    return initialRooms;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialRooms;
  }
};

const getStoredRoomTypes = (): RoomType[] => {
  const data = localStorage.getItem(ROOM_TYPES_KEY);
  if (!data) {
    localStorage.setItem(ROOM_TYPES_KEY, JSON.stringify(initialRoomTypes));
    return initialRoomTypes;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialRoomTypes;
  }
};

export const roomService = {
  getAll: async (filters?: { checkIn?: string; checkOut?: string; type?: string; minPrice?: number; maxPrice?: number; search?: string }): Promise<Room[]> => {
    try {
      const res = await api.get('/rooms', { params: filters });
      if (res.data?.rooms && Array.isArray(res.data.rooms) && res.data.rooms.length > 0) {
        const rooms = res.data.rooms.map(mapBackendRoom);
        localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
        return rooms;
      }
    } catch (err) {
      console.warn('Backend API /rooms unreachable, using local data fallback.', err);
    }
    return simulateDelay(getStoredRooms());
  },

  getById: async (id: string): Promise<Room | undefined> => {
    try {
      const res = await api.get(`/rooms/${id}`);
      if (res.data?.room) {
        return mapBackendRoom(res.data.room);
      }
    } catch (err) {
      console.warn(`Backend API /rooms/${id} unreachable, using local fallback.`, err);
    }
    const rooms = getStoredRooms();
    const room = rooms.find((r) => String(r.id) === String(id));
    return simulateDelay(room);
  },

  getBookedDates: async (id: string): Promise<{ checkIn: string; checkOut: string; status: string }[]> => {
    try {
      const res = await api.get(`/rooms/${id}/booked-dates`);
      if (res.data?.bookedDates) {
        return res.data.bookedDates;
      }
    } catch (err) {
      console.warn(`Backend API /rooms/${id}/booked-dates unreachable.`, err);
    }
    return [];
  },

  create: async (roomData: Omit<Room, 'id'>): Promise<Room> => {
    try {
      const res = await api.post('/rooms', {
        room_number: roomData.roomNumber,
        name: roomData.name,
        price_per_night: roomData.pricePerNight,
        capacity: roomData.maxAdults,
        size_sqm: Math.round(roomData.roomSize / 10.764),
        status: roomData.status.toLowerCase(),
        primary_image: roomData.images[0] || '',
        images: roomData.images,
        amenities: roomData.amenities,
        description: roomData.description
      });
      if (res.data?.roomId) {
        const newRoom: Room = {
          ...roomData,
          id: String(res.data.roomId)
        };
        const rooms = getStoredRooms();
        rooms.unshift(newRoom);
        localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
        return newRoom;
      }
    } catch (err) {
      console.warn('Backend API create room failed, using local storage.', err);
    }
    const rooms = getStoredRooms();
    const newRoom: Room = {
      ...roomData,
      id: `room-${Date.now()}`
    };
    rooms.unshift(newRoom);
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    return simulateDelay(newRoom);
  },

  update: async (id: string, updates: Partial<Room>): Promise<Room> => {
    try {
      await api.put(`/rooms/${id}`, {
        name: updates.name,
        room_number: updates.roomNumber,
        price_per_night: updates.pricePerNight,
        capacity: updates.maxAdults,
        status: updates.status?.toLowerCase(),
        description: updates.description,
        amenities: updates.amenities,
        images: updates.images
      });
    } catch (err) {
      console.warn('Backend API update room failed, using local fallback.', err);
    }
    const rooms = getStoredRooms();
    const index = rooms.findIndex((r) => String(r.id) === String(id));
    if (index === -1) throw new Error(`Room with ID ${id} not found`);
    const updated = { ...rooms[index], ...updates };
    rooms[index] = updated;
    localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
    return simulateDelay(updated);
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/rooms/${id}`);
    } catch (err) {
      console.warn('Backend API delete room failed, using local fallback.', err);
    }
    const rooms = getStoredRooms();
    const filtered = rooms.filter((r) => String(r.id) !== String(id));
    localStorage.setItem(ROOMS_KEY, JSON.stringify(filtered));
    return simulateDelay(true);
  },

  // Room Types
  getRoomTypes: async (): Promise<RoomType[]> => {
    try {
      const res = await api.get('/rooms/types');
      if (res.data?.roomTypes && Array.isArray(res.data.roomTypes)) {
        return res.data.roomTypes.map((rt: any) => ({
          id: String(rt.id),
          name: rt.name,
          description: rt.description || '',
          basePrice: Number(rt.base_price),
          maxGuests: rt.max_guests || 2,
          amenities: ['Wi-Fi', 'Air Conditioning', 'En-suite Bath'],
          images: [],
          status: 'active'
        }));
      }
    } catch (err) {
      console.warn('Backend API getRoomTypes failed, using local fallback.', err);
    }
    return simulateDelay(getStoredRoomTypes());
  },

  createRoomType: async (data: Omit<RoomType, 'id'>): Promise<RoomType> => {
    try {
      const res = await api.post('/rooms/types', {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        maxGuests: data.maxGuests
      });
      if (res.data?.roomType) {
        const created: RoomType = {
          ...data,
          id: String(res.data.roomType.id)
        };
        const list = getStoredRoomTypes();
        list.push(created);
        localStorage.setItem(ROOM_TYPES_KEY, JSON.stringify(list));
        return created;
      }
    } catch (err) {
      console.warn('Backend API createRoomType failed, falling back to local.', err);
    }

    const list = getStoredRoomTypes();
    const newItem: RoomType = { ...data, id: `rt-${Date.now()}` };
    list.push(newItem);
    localStorage.setItem(ROOM_TYPES_KEY, JSON.stringify(list));
    return simulateDelay(newItem);
  },

  updateRoomType: async (id: string, updates: Partial<RoomType>): Promise<RoomType> => {
    try {
      await api.put(`/rooms/types/${id}`, {
        name: updates.name,
        description: updates.description,
        basePrice: updates.basePrice,
        maxGuests: updates.maxGuests
      });
    } catch (err) {
      console.warn('Backend API updateRoomType failed, falling back to local.', err);
    }

    const list = getStoredRoomTypes();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Room Type not found');
    list[index] = { ...list[index], ...updates };
    localStorage.setItem(ROOM_TYPES_KEY, JSON.stringify(list));
    return simulateDelay(list[index]);
  },

  deleteRoomType: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/rooms/types/${id}`);
    } catch (err) {
      console.warn('Backend API deleteRoomType failed, falling back to local.', err);
    }

    const list = getStoredRoomTypes();
    const filtered = list.filter((r) => r.id !== id);
    localStorage.setItem(ROOM_TYPES_KEY, JSON.stringify(filtered));
    return simulateDelay(true);
  }
};
