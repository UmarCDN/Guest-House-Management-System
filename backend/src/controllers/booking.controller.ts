import { Response } from 'express';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Authentication required to create a booking.' });
      return;
    }

    const {
      room_id,
      guest_name,
      guest_email,
      guest_phone,
      check_in_date,
      check_out_date,
      guests_count,
      total_price,
      payment_method = 'credit_card',
      special_requests
    } = req.body;

    if (!room_id || !check_in_date || !check_out_date || !total_price) {
      res.status(400).json({ message: 'room_id, check_in_date, check_out_date, and total_price are required.' });
      return;
    }

    // Verify room exists
    const [rooms]: any = await pool.query('SELECT * FROM rooms WHERE id = ?', [room_id]);
    if (rooms.length === 0) {
      res.status(404).json({ message: 'Selected room not found.' });
      return;
    }

    // Check for date conflicts (prevent double-booking)
    const [conflicts]: any = await pool.query(
      `SELECT id, booking_reference FROM bookings 
       WHERE room_id = ? 
         AND status NOT IN ('cancelled', 'checked_out')
         AND check_in_date < ? 
         AND check_out_date > ?`,
      [room_id, check_out_date, check_in_date]
    );

    if (conflicts.length > 0) {
      res.status(409).json({ 
        message: 'This room is already reserved for the selected dates. Please choose different dates or select another room.',
        conflictingBooking: conflicts[0].booking_reference
      });
      return;
    }

    // Generate unique reference BK-XXXXXX
    const reference = 'BK-' + Math.floor(100000 + Math.random() * 900000);

    const [result]: any = await pool.query(
      `INSERT INTO bookings (
        booking_reference, user_id, room_id, guest_name, guest_email, guest_phone,
        check_in_date, check_out_date, guests_count, total_price, status, payment_status,
        payment_method, special_requests
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid', ?, ?)`,
      [
        reference,
        userId,
        room_id,
        guest_name || req.user?.name || 'Valued Guest',
        guest_email || req.user?.email,
        guest_phone || '',
        check_in_date,
        check_out_date,
        guests_count || 1,
        total_price,
        payment_method,
        special_requests || null
      ]
    );

    // If booking starts today or earlier, update room status to occupied in MySQL
    await pool.query(
      `UPDATE rooms SET status = 'occupied' 
       WHERE id = ? 
         AND status != 'maintenance'
         AND ? <= CURDATE() AND ? > CURDATE()`,
      [room_id, check_in_date, check_out_date]
    );

    res.status(201).json({
      message: 'Booking created successfully!',
      booking: {
        id: result.insertId,
        booking_reference: reference,
        room_id,
        room_name: rooms[0].name,
        check_in_date,
        check_out_date,
        guests_count: guests_count || 1,
        total_price,
        status: 'confirmed',
        payment_status: 'paid'
      }
    });
  } catch (err: any) {
    console.error('Create booking error:', err);
    res.status(500).json({ message: 'Server error creating booking', error: err.message });
  }
};

export const getAllBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;

    let query = `
      SELECT b.*, r.name as room_name, r.room_number, r.primary_image as room_image
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ` AND b.status = ?`;
      params.push(status);
    }
    if (search) {
      query += ` AND (b.booking_reference LIKE ? OR b.guest_name LIKE ? OR b.guest_email LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY b.created_at DESC`;

    const [rows]: any = await pool.query(query, params);
    res.json({ bookings: rows, count: rows.length });
  } catch (err: any) {
    console.error('Get bookings error:', err);
    res.status(500).json({ message: 'Server error fetching bookings', error: err.message });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const userEmail = req.user?.email;
    const [rows]: any = await pool.query(`
      SELECT b.*, r.name as room_name, r.room_number, r.primary_image as room_image
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE b.user_id = ? OR (b.guest_email = ? AND b.guest_email IS NOT NULL AND b.guest_email != '')
      ORDER BY b.created_at DESC
    `, [userId, userEmail || '']);

    res.json({ bookings: rows, count: rows.length });
  } catch (err: any) {
    console.error('Get my bookings error:', err);
    res.status(500).json({ message: 'Server error fetching your bookings', error: err.message });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isNumeric = !isNaN(Number(id));
    const [rows]: any = await pool.query(`
      SELECT b.*, r.name as room_name, r.room_number, r.primary_image as room_image,
             r.description as room_description, r.amenities as room_amenities
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      WHERE ${isNumeric ? 'b.id = ?' : 'b.booking_reference = ?'}
    `, [isNumeric ? Number(id) : id]);

    if (rows.length === 0) {
      res.status(404).json({ message: 'Booking not found.' });
      return;
    }

    const booking = rows[0];
    if (typeof booking.room_amenities === 'string') {
      booking.room_amenities = JSON.parse(booking.room_amenities);
    }

    res.json({ booking });
  } catch (err: any) {
    console.error('Get booking details error:', err);
    res.status(500).json({ message: 'Server error fetching booking details', error: err.message });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;

    // Normalize status strings
    const normalizedStatus = status ? status.toLowerCase().replace(/\s+/g, '_') : null;
    const normalizedPaymentStatus = payment_status ? payment_status.toLowerCase() : null;
    const isNumeric = !isNaN(Number(id));

    const [result]: any = await pool.query(
      `UPDATE bookings SET 
        status = COALESCE(?, status), 
        payment_status = COALESCE(?, payment_status) 
       WHERE ${isNumeric ? 'id = ?' : 'booking_reference = ?'}`,
      [normalizedStatus, normalizedPaymentStatus, isNumeric ? Number(id) : id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Booking not found.' });
      return;
    }

    // Keep rooms table in sync with real-time stay changes
    if (normalizedStatus === 'checked_in') {
      await pool.query(
        `UPDATE rooms SET status = 'occupied' 
         WHERE id = (SELECT room_id FROM bookings WHERE ${isNumeric ? 'id = ?' : 'booking_reference = ?'}) 
           AND status != 'maintenance'`,
        [isNumeric ? Number(id) : id]
      );
    } else if (normalizedStatus === 'checked_out' || normalizedStatus === 'cancelled') {
      await pool.query(
        `UPDATE rooms r
         SET r.status = 'available'
         WHERE r.id = (SELECT room_id FROM bookings WHERE ${isNumeric ? 'id = ?' : 'booking_reference = ?'})
           AND r.status = 'occupied'
           AND NOT EXISTS (
             SELECT 1 FROM bookings b 
             WHERE b.room_id = r.id 
               AND b.id != ${isNumeric ? '?' : '(SELECT id FROM bookings WHERE booking_reference = ?)'}
               AND b.status IN ('confirmed', 'checked_in')
               AND b.check_in_date <= CURDATE() 
               AND b.check_out_date > CURDATE()
           )`,
        [isNumeric ? Number(id) : id, isNumeric ? Number(id) : id]
      );
    }

    res.json({ message: 'Booking status updated successfully.' });
  } catch (err: any) {
    console.error('Update booking status error:', err);
    res.status(500).json({ message: 'Server error updating booking status', error: err.message });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const isNumeric = !isNaN(Number(id));

    let query = `UPDATE bookings SET status = "cancelled" WHERE ${isNumeric ? 'id = ?' : 'booking_reference = ?'}`;
    const params: any[] = [isNumeric ? Number(id) : id];

    if (userRole !== 'admin') {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    const [result]: any = await pool.query(query, params);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Booking not found or not authorized to cancel.' });
      return;
    }

    // Release room to available if it has no other active booking
    await pool.query(
      `UPDATE rooms r
       SET r.status = 'available'
       WHERE r.id = (SELECT room_id FROM bookings WHERE ${isNumeric ? 'id = ?' : 'booking_reference = ?'})
         AND r.status = 'occupied'
         AND NOT EXISTS (
           SELECT 1 FROM bookings b 
           WHERE b.room_id = r.id 
             AND b.status IN ('confirmed', 'checked_in')
             AND b.check_in_date <= CURDATE() 
             AND b.check_out_date > CURDATE()
         )`,
      [isNumeric ? Number(id) : id]
    );

    res.json({ message: 'Booking cancelled successfully.' });
  } catch (err: any) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ message: 'Server error cancelling booking', error: err.message });
  }
};
