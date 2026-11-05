import api from './api';

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  totalGuests: number;
  todayCheckIns: number;
  todayCheckOuts: number;
  occupancyRate: number;
}

export interface RevenueTrendItem {
  month: string;
  revenue: number;
}

export interface BookingVolumeItem {
  month: string;
  count: number;
}

export interface RoomDistribution {
  available: number;
  occupied: number;
  maintenance: number;
}

export interface DashboardCharts {
  revenueTrend: RevenueTrendItem[];
  bookingVolume: BookingVolumeItem[];
  roomDistribution: RoomDistribution;
}

export interface DashboardRecentBooking {
  id: string;
  dbId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  bookingStatus: 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled' | 'Pending';
  paymentStatus: 'Paid' | 'Pending';
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  charts: DashboardCharts;
  recentBookings: DashboardRecentBooking[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardData> => {
    try {
      const res = await api.get<DashboardData>('/dashboard/stats');
      if (res.data && res.data.stats) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend API /dashboard/stats unreachable, using fallback structure.', err);
    }

    // Default empty fallback
    return {
      stats: {
        totalRooms: 0,
        availableRooms: 0,
        occupiedRooms: 0,
        maintenanceRooms: 0,
        totalBookings: 0,
        pendingBookings: 0,
        totalRevenue: 0,
        totalGuests: 0,
        todayCheckIns: 0,
        todayCheckOuts: 0,
        occupancyRate: 0
      },
      charts: {
        revenueTrend: [],
        bookingVolume: [],
        roomDistribution: { available: 0, occupied: 0, maintenance: 0 }
      },
      recentBookings: []
    };
  }
};
