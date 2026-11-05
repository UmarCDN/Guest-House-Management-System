import { Response } from 'express';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. Room metrics
    const [roomsTotal]: any = await pool.query('SELECT COUNT(*) as count FROM rooms');
    const [availableRooms]: any = await pool.query("SELECT COUNT(*) as count FROM rooms WHERE LOWER(status) = 'available'");
    const [occupiedRooms]: any = await pool.query("SELECT COUNT(*) as count FROM rooms WHERE LOWER(status) = 'occupied'");
    const [maintenanceRooms]: any = await pool.query("SELECT COUNT(*) as count FROM rooms WHERE LOWER(status) = 'maintenance'");

    const totalRoomsCount = Number(roomsTotal[0]?.count || 0);
    const availableCount = Number(availableRooms[0]?.count || 0);
    const occupiedCount = Number(occupiedRooms[0]?.count || 0);
    const maintenanceCount = Number(maintenanceRooms[0]?.count || 0);

    // 2. Bookings and revenue metrics
    const [bookingsTotal]: any = await pool.query('SELECT COUNT(*) as count FROM bookings');
    const [pendingBookings]: any = await pool.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending' OR payment_status = 'pending'");
    const [revenueTotal]: any = await pool.query("SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE status != 'cancelled'");
    const [guestsTotal]: any = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");

    // 3. Today's Arrivals and Departures
    const [todayCheckIns]: any = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE DATE(check_in_date) = CURDATE() AND status != 'cancelled'"
    );
    const [todayCheckOuts]: any = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE DATE(check_out_date) = CURDATE() AND status != 'cancelled'"
    );

    // Fallback if no check-ins today specifically: count active confirmed check-ins for current week
    const checkInsCount = Number(todayCheckIns[0]?.count || 0);
    const checkOutsCount = Number(todayCheckOuts[0]?.count || 0);

    // 4. Occupancy Rate
    const occupancyRate = totalRoomsCount > 0 ? Math.round((occupiedCount / totalRoomsCount) * 100) : 0;

    // 5. Monthly Revenue Trend from MySQL (Grouped by Month)
    const [revenueTrendRows]: any = await pool.query(`
      SELECT 
        DATE_FORMAT(b.check_in_date, '%b') as month,
        DATE_FORMAT(b.check_in_date, '%Y-%m') as yearMonth,
        COALESCE(SUM(b.total_price), 0) as revenue
      FROM bookings b
      WHERE b.status != 'cancelled'
      GROUP BY DATE_FORMAT(b.check_in_date, '%Y-%m'), DATE_FORMAT(b.check_in_date, '%b')
      ORDER BY yearMonth ASC
      LIMIT 6
    `);

    // 6. Monthly Booking Volume from MySQL (Grouped by Month)
    const [volumeRows]: any = await pool.query(`
      SELECT 
        DATE_FORMAT(b.check_in_date, '%b') as month,
        DATE_FORMAT(b.check_in_date, '%Y-%m') as yearMonth,
        COUNT(b.id) as count
      FROM bookings b
      WHERE b.status != 'cancelled'
      GROUP BY DATE_FORMAT(b.check_in_date, '%Y-%m'), DATE_FORMAT(b.check_in_date, '%b')
      ORDER BY yearMonth ASC
      LIMIT 6
    `);

    // 7. Recent 8 bookings with guest, room, and folio details
    const [recentBookings]: any = await pool.query(`
      SELECT b.id, b.booking_reference, b.guest_name, b.guest_email, b.guest_phone,
             b.check_in_date, b.check_out_date, b.total_price, b.status, b.payment_status,
             b.payment_method, b.created_at, r.name as room_name, r.room_number
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      ORDER BY b.created_at DESC
      LIMIT 8
    `);

    res.json({
      stats: {
        totalRooms: totalRoomsCount,
        availableRooms: availableCount,
        occupiedRooms: occupiedCount,
        maintenanceRooms: maintenanceCount,
        totalBookings: Number(bookingsTotal[0]?.count || 0),
        pendingBookings: Number(pendingBookings[0]?.count || 0),
        totalRevenue: Number(revenueTotal[0]?.total || 0),
        totalGuests: Number(guestsTotal[0]?.count || 0),
        todayCheckIns: checkInsCount,
        todayCheckOuts: checkOutsCount,
        occupancyRate
      },
      charts: {
        revenueTrend: revenueTrendRows.map((r: any) => ({
          month: r.month,
          revenue: Number(r.revenue)
        })),
        bookingVolume: volumeRows.map((v: any) => ({
          month: v.month,
          count: Number(v.count)
        })),
        roomDistribution: {
          available: availableCount,
          occupied: occupiedCount,
          maintenance: maintenanceCount
        }
      },
      recentBookings: recentBookings.map((b: any) => ({
        id: b.booking_reference || `GH-2026-${b.id}`,
        dbId: b.id,
        guestName: b.guest_name,
        guestEmail: b.guest_email,
        guestPhone: b.guest_phone || 'N/A',
        roomName: b.room_name,
        roomNumber: b.room_number,
        checkIn: b.check_in_date instanceof Date ? b.check_in_date.toISOString().split('T')[0] : String(b.check_in_date || '').split('T')[0],
        checkOut: b.check_out_date instanceof Date ? b.check_out_date.toISOString().split('T')[0] : String(b.check_out_date || '').split('T')[0],
        totalAmount: Number(b.total_price),
        bookingStatus: b.status === 'checked_in' ? 'Checked In' : b.status === 'checked_out' ? 'Checked Out' : b.status === 'cancelled' ? 'Cancelled' : 'Confirmed',
        paymentStatus: b.payment_status === 'paid' ? 'Paid' : 'Pending',
        createdAt: b.created_at instanceof Date ? b.created_at.toISOString() : String(b.created_at || new Date().toISOString())
      }))
    });
  } catch (err: any) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Server error fetching dashboard statistics', error: err.message });
  }
};

