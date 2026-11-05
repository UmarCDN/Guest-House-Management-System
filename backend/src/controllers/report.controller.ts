import { Response } from 'express';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getRevenueReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fromDate, toDate, roomId, status } = req.query;

    let whereClause = "WHERE b.status != 'cancelled'";
    const params: any[] = [];

    if (fromDate) {
      whereClause += " AND b.check_in_date >= ?";
      params.push(fromDate);
    }
    if (toDate) {
      whereClause += " AND b.check_in_date <= ?";
      params.push(toDate);
    }
    if (roomId && roomId !== 'All') {
      whereClause += " AND b.room_id = ?";
      params.push(roomId);
    }
    if (status && status !== 'All') {
      whereClause += " AND b.status = ?";
      params.push(status);
    }

    // 1. Overall Revenue Summary
    const [summaryRows]: any = await pool.query(`
      SELECT 
        COALESCE(SUM(b.total_price), 0) as total_gross_revenue,
        COALESCE(SUM(CASE WHEN b.payment_status = 'paid' THEN b.total_price ELSE 0 END), 0) as total_paid_revenue,
        COALESCE(SUM(CASE WHEN b.payment_status != 'paid' THEN b.total_price ELSE 0 END), 0) as total_pending_revenue,
        COUNT(b.id) as total_bookings,
        COALESCE(AVG(b.total_price), 0) as average_folio,
        COALESCE(SUM(DATEDIFF(b.check_out_date, b.check_in_date)), 0) as total_nights_sold
      FROM bookings b
      ${whereClause}
    `, params);

    // Cancelled bookings count in range
    let cancelledWhere = "WHERE b.status = 'cancelled'";
    const cancelledParams: any[] = [];
    if (fromDate) {
      cancelledWhere += " AND b.check_in_date >= ?";
      cancelledParams.push(fromDate);
    }
    if (toDate) {
      cancelledWhere += " AND b.check_in_date <= ?";
      cancelledParams.push(toDate);
    }
    const [cancelledRows]: any = await pool.query(`
      SELECT COUNT(*) as cancelled_count, COALESCE(SUM(total_price), 0) as lost_revenue 
      FROM bookings b ${cancelledWhere}
    `, cancelledParams);

    // 2. Revenue Breakdown by Room
    const [roomBreakdown]: any = await pool.query(`
      SELECT 
        r.id as room_id,
        r.room_number,
        r.name as room_name,
        COALESCE(rt.name, 'Standard') as room_type,
        COUNT(b.id) as bookings_count,
        COALESCE(SUM(b.total_price), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN b.payment_status = 'paid' THEN b.total_price ELSE 0 END), 0) as paid_revenue
      FROM rooms r
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      LEFT JOIN bookings b ON r.id = b.room_id AND b.status != 'cancelled'
        ${fromDate ? 'AND b.check_in_date >= ?' : ''}
        ${toDate ? 'AND b.check_in_date <= ?' : ''}
      GROUP BY r.id
      ORDER BY total_revenue DESC
    `, [fromDate, toDate].filter(Boolean));

    // 3. Revenue Breakdown by Payment Method
    const [paymentBreakdown]: any = await pool.query(`
      SELECT 
        COALESCE(b.payment_method, 'Unspecified') as payment_method,
        COUNT(b.id) as transactions_count,
        COALESCE(SUM(b.total_price), 0) as total_amount
      FROM bookings b
      ${whereClause}
      GROUP BY b.payment_method
      ORDER BY total_amount DESC
    `, params);

    // 4. Monthly/Daily Revenue Trend
    const [trendRows]: any = await pool.query(`
      SELECT 
        DATE_FORMAT(b.check_in_date, '%Y-%m-%d') as booking_date,
        COUNT(b.id) as bookings_count,
        COALESCE(SUM(b.total_price), 0) as revenue
      FROM bookings b
      ${whereClause}
      GROUP BY DATE_FORMAT(b.check_in_date, '%Y-%m-%d')
      ORDER BY booking_date ASC
    `, params);

    // 5. Audited Transactions / Detailed Journal (Latest 50 bookings in range)
    const [journalRows]: any = await pool.query(`
      SELECT 
        b.id,
        b.booking_reference,
        b.guest_name,
        b.guest_email,
        b.guest_phone,
        r.name as room_name,
        r.room_number,
        b.check_in_date,
        b.check_out_date,
        DATEDIFF(b.check_out_date, b.check_in_date) as nights,
        b.total_price,
        b.payment_method,
        b.payment_status,
        b.status,
        b.created_at
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT 100
    `, params);

    // Occupancy Rate: Total rooms vs occupied in DB
    const [roomsTotal]: any = await pool.query('SELECT COUNT(*) as count FROM rooms');
    const [roomsOccupied]: any = await pool.query("SELECT COUNT(*) as count FROM rooms WHERE status = 'occupied'");
    const totalRooms = roomsTotal[0]?.count || 1;
    const occupiedRooms = roomsOccupied[0]?.count || 0;
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

    res.json({
      summary: {
        totalGrossRevenue: Number(summaryRows[0]?.total_gross_revenue || 0),
        totalPaidRevenue: Number(summaryRows[0]?.total_paid_revenue || 0),
        totalPendingRevenue: Number(summaryRows[0]?.total_pending_revenue || 0),
        totalBookings: Number(summaryRows[0]?.total_bookings || 0),
        cancelledBookings: Number(cancelledRows[0]?.cancelled_count || 0),
        lostRevenue: Number(cancelledRows[0]?.lost_revenue || 0),
        averageFolio: Number(Number(summaryRows[0]?.average_folio || 0).toFixed(2)),
        totalNightsSold: Number(summaryRows[0]?.total_nights_sold || 0),
        occupancyRate,
        totalRooms,
        occupiedRooms
      },
      roomBreakdown: roomBreakdown.map((r: any) => ({
        roomId: String(r.room_id),
        roomNumber: r.room_number,
        roomName: r.room_name,
        roomType: r.room_type,
        bookingsCount: Number(r.bookings_count || 0),
        totalRevenue: Number(r.total_revenue || 0),
        paidRevenue: Number(r.paid_revenue || 0)
      })),
      paymentBreakdown: paymentBreakdown.map((p: any) => ({
        paymentMethod: p.payment_method,
        transactionsCount: Number(p.transactions_count || 0),
        totalAmount: Number(p.total_amount || 0)
      })),
      trend: trendRows.map((t: any) => ({
        date: t.booking_date,
        bookingsCount: Number(t.bookings_count || 0),
        revenue: Number(t.revenue || 0)
      })),
      journal: journalRows.map((j: any) => ({
        id: String(j.id),
        reference: j.booking_reference,
        guestName: j.guest_name,
        guestEmail: j.guest_email,
        guestPhone: j.guest_phone,
        roomName: j.room_name,
        roomNumber: j.room_number,
        checkIn: j.check_in_date instanceof Date ? j.check_in_date.toISOString().split('T')[0] : String(j.check_in_date || '').split('T')[0],
        checkOut: j.check_out_date instanceof Date ? j.check_out_date.toISOString().split('T')[0] : String(j.check_out_date || '').split('T')[0],
        nights: Number(j.nights || 1),
        totalAmount: Number(j.total_price || 0),
        paymentMethod: j.payment_method || 'Cash',
        paymentStatus: j.payment_status === 'paid' ? 'Paid' : 'Pending',
        bookingStatus: j.status ? j.status.charAt(0).toUpperCase() + j.status.slice(1) : 'Confirmed',
        createdAt: j.created_at instanceof Date ? j.created_at.toISOString() : String(j.created_at || '')
      }))
    });
  } catch (err: any) {
    console.error('Error fetching revenue report:', err);
    res.status(500).json({ message: 'Server error compiling revenue report', error: err.message });
  }
};
