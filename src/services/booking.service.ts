import api, { simulateDelay } from './api';
import { Booking, BookingStatus, PaymentStatus } from '../types';
import { initialBookings } from '../data/bookings';

const BOOKINGS_KEY = 'guesthouse_bookings_data';

const mapBackendBooking = (b: any): Booking => {
  return {
    id: b.booking_reference || (b.id ? `GH-2026-${b.id}` : `GH-2026-${Math.floor(1000 + Math.random() * 9000)}`),
    guestName: b.guest_name || 'Valued Guest',
    guestEmail: b.guest_email || '',
    guestPhone: b.guest_phone || '',
    guestCnic: '42101-1234567-1',
    guestAddress: 'Default Address',
    guestCity: 'Islamabad',
    guestCountry: 'Pakistan',
    roomId: String(b.room_id),
    roomNumber: b.room_number || '101',
    roomName: b.room_name || 'Serene Room',
    roomType: 'Deluxe',
    checkIn: b.check_in_date ? b.check_in_date.split('T')[0] : '2026-09-15',
    checkOut: b.check_out_date ? b.check_out_date.split('T')[0] : '2026-09-17',
    adults: b.guests_count || 1,
    children: 0,
    numberOfRooms: 1,
    nights: 2,
    roomPrice: typeof b.total_price === 'number' ? b.total_price : parseFloat(b.total_price || '200'),
    taxes: 0,
    discount: 0,
    totalAmount: typeof b.total_price === 'number' ? b.total_price : parseFloat(b.total_price || '200'),
    paidAmount: typeof b.total_price === 'number' ? b.total_price : parseFloat(b.total_price || '200'),
    remainingAmount: 0,
    paymentMethod: (b.payment_method as any) || 'Credit/Debit Card',
    paymentStatus: b.payment_status === 'paid' ? 'Paid' : 'Pending',
    bookingStatus: b.status === 'checked_in' ? 'Checked In' : b.status === 'checked_out' ? 'Checked Out' : b.status === 'cancelled' ? 'Cancelled' : 'Confirmed',
    bookingSource: 'Website',
    specialRequests: b.special_requests || '',
    createdAt: b.created_at || new Date().toISOString()
  };
};

const getStoredBookings = (): Booking[] => {
  const data = localStorage.getItem(BOOKINGS_KEY);
  if (!data) {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(initialBookings));
    return initialBookings;
  }
  try {
    return JSON.parse(data);
  } catch {
    return initialBookings;
  }
};

export const bookingService = {
  getAll: async (): Promise<Booking[]> => {
    try {
      const res = await api.get('/bookings');
      if (res.data?.bookings && Array.isArray(res.data.bookings)) {
        const bookings = res.data.bookings.map(mapBackendBooking);
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
        return bookings;
      }
    } catch (err) {
      console.warn('Backend API /bookings unreachable, using local bookings fallback.', err);
    }
    return simulateDelay(getStoredBookings());
  },

  getById: async (id: string): Promise<Booking | undefined> => {
    try {
      const res = await api.get(`/bookings/${id}`);
      if (res.data?.booking) {
        return mapBackendBooking(res.data.booking);
      }
    } catch (err) {
      console.warn(`Backend API /bookings/${id} unreachable, using local fallback.`, err);
    }
    const bookings = getStoredBookings();
    const booking = bookings.find((b) => b.id.toLowerCase() === id.toLowerCase());
    return simulateDelay(booking);
  },

  getByGuestEmail: async (email: string): Promise<Booking[]> => {
    try {
      const res = await api.get('/bookings/my');
      if (res.data?.bookings && Array.isArray(res.data.bookings)) {
        return res.data.bookings.map(mapBackendBooking);
      }
    } catch (err) {
      console.warn('Backend API /bookings/my unreachable, filtering local.', err);
    }
    const bookings = getStoredBookings();
    const filtered = bookings.filter((b) => b.guestEmail.toLowerCase() === email.toLowerCase());
    return simulateDelay(filtered);
  },

  create: async (bookingData: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> => {
    try {
      const res = await api.post('/bookings', {
        room_id: parseInt(bookingData.roomId, 10) || 1,
        guest_name: bookingData.guestName,
        guest_email: bookingData.guestEmail,
        guest_phone: bookingData.guestPhone,
        check_in_date: bookingData.checkIn,
        check_out_date: bookingData.checkOut,
        guests_count: (bookingData.adults || 1) + (bookingData.children || 0),
        total_price: bookingData.totalAmount,
        payment_method: bookingData.paymentMethod,
        special_requests: bookingData.specialRequests
      });

      if (res.data?.booking) {
        const newBooking: Booking = {
          ...bookingData,
          id: res.data.booking.booking_reference || `GH-2026-${res.data.booking.id}`,
          createdAt: new Date().toISOString()
        };
        const bookings = getStoredBookings();
        bookings.unshift(newBooking);
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
        return newBooking;
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      console.warn('Backend API create booking failed, falling back to local.', err);
    }

    const bookings = getStoredBookings();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newBooking: Booking = {
      ...bookingData,
      id: `GH-2026-${randomCode}`,
      createdAt: new Date().toISOString()
    };
    bookings.unshift(newBooking);
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    return simulateDelay(newBooking);
  },

  updateStatus: async (id: string, status: BookingStatus): Promise<Booking> => {
    try {
      await api.patch(`/bookings/${id}/status`, { status });
    } catch (err) {
      console.warn(`Backend update status failed for ${id}, syncing local:`, err);
    }
    const bookings = getStoredBookings();
    const index = bookings.findIndex((b) => b.id.toLowerCase() === id.toLowerCase());
    if (index !== -1) {
      bookings[index].bookingStatus = status;
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
      return bookings[index];
    }
    return { id, bookingStatus: status } as any;
  },

  updatePaymentStatus: async (id: string, status: PaymentStatus, paidAmount?: number): Promise<Booking> => {
    try {
      await api.patch(`/bookings/${id}/status`, { payment_status: status });
    } catch (err) {
      console.warn(`Backend update payment status failed for ${id}, syncing local:`, err);
    }
    const bookings = getStoredBookings();
    const index = bookings.findIndex((b) => b.id.toLowerCase() === id.toLowerCase());
    if (index !== -1) {
      bookings[index].paymentStatus = status;
      if (paidAmount !== undefined) {
        bookings[index].paidAmount = paidAmount;
        bookings[index].remainingAmount = Math.max(0, bookings[index].totalAmount - paidAmount);
      }
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
      return bookings[index];
    }
    return { id, paymentStatus: status } as any;
  },

  update: async (id: string, updates: Partial<Booking>): Promise<Booking> => {
    const bookings = getStoredBookings();
    const index = bookings.findIndex((b) => b.id.toLowerCase() === id.toLowerCase());
    if (index === -1) throw new Error(`Booking ${id} not found`);
    bookings[index] = { ...bookings[index], ...updates };
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    return simulateDelay(bookings[index]);
  },

  cancel: async (id: string): Promise<Booking> => {
    try {
      await api.post(`/bookings/${id}/cancel`);
    } catch (err) {
      console.warn(`Backend cancel failed for ${id}, syncing local:`, err);
    }
    return bookingService.updateStatus(id, 'Cancelled');
  }
};
