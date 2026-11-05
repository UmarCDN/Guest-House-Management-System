import api from './api';

export interface RevenueSummary {
  totalGrossRevenue: number;
  totalPaidRevenue: number;
  totalPendingRevenue: number;
  totalBookings: number;
  cancelledBookings: number;
  lostRevenue: number;
  averageFolio: number;
  totalNightsSold: number;
  occupancyRate: number;
  totalRooms: number;
  occupiedRooms: number;
}

export interface RoomRevenue {
  roomId: string;
  roomNumber: string;
  roomName: string;
  roomType: string;
  bookingsCount: number;
  totalRevenue: number;
  paidRevenue: number;
}

export interface PaymentRevenue {
  paymentMethod: string;
  transactionsCount: number;
  totalAmount: number;
}

export interface DailyTrend {
  date: string;
  bookingsCount: number;
  revenue: number;
}

export interface FinancialJournalItem {
  id: string;
  reference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: string;
}

export interface RevenueReportData {
  summary: RevenueSummary;
  roomBreakdown: RoomRevenue[];
  paymentBreakdown: PaymentRevenue[];
  trend: DailyTrend[];
  journal: FinancialJournalItem[];
}

export interface ReportFilterParams {
  fromDate?: string;
  toDate?: string;
  roomId?: string;
  status?: string;
}

export const reportService = {
  getRevenueReport: async (params?: ReportFilterParams): Promise<RevenueReportData> => {
    try {
      const res = await api.get<RevenueReportData>('/reports/revenue', { params });
      if (res.data) {
        return res.data;
      }
    } catch (err) {
      console.warn('Backend API /reports/revenue unreachable, using fallback calculation.', err);
    }

    // Default fallback structure
    return {
      summary: {
        totalGrossRevenue: 0,
        totalPaidRevenue: 0,
        totalPendingRevenue: 0,
        totalBookings: 0,
        cancelledBookings: 0,
        lostRevenue: 0,
        averageFolio: 0,
        totalNightsSold: 0,
        occupancyRate: 0,
        totalRooms: 0,
        occupiedRooms: 0
      },
      roomBreakdown: [],
      paymentBreakdown: [],
      trend: [],
      journal: []
    };
  }
};
