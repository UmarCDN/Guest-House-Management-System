import { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const getAllRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, type, minPrice, maxPrice, capacity, search, checkIn, checkOut } = req.query;

    let query = `
      SELECT r.*, rt.name as room_type_name, rt.slug as room_type_slug, rt.bed_type 
      FROM rooms r 
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ` AND r.status = ?`;
      params.push(status);
    }
    if (type && type !== 'All') {
      query += ` AND (rt.slug = ? OR rt.name LIKE ? OR r.name LIKE ?)`;
      params.push(type, `%${type}%`, `%${type}%`);
    }
    if (minPrice) {
      query += ` AND r.price_per_night >= ?`;
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      query += ` AND r.price_per_night <= ?`;
      params.push(Number(maxPrice));
    }
    if (capacity) {
      query += ` AND r.capacity >= ?`;
      params.push(Number(capacity));
    }
    if (search) {
      query += ` AND (r.name LIKE ? OR r.description LIKE ? OR r.room_number LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY r.price_per_night ASC`;

    const [rows]: any = await pool.query(query, params);

    // Dynamic date-based availability check:
    // If checkIn & checkOut provided, check conflicts for that window.
    // If not provided, check active stays for TODAY (CURDATE() < check_out_date AND CURDATE() >= check_in_date).
    let conflictsQuery: string;
    let conflictsParams: any[];

    if (checkIn && checkOut) {
      conflictsQuery = `
        SELECT room_id, guest_name, guest_phone, booking_reference, check_in_date, check_out_date, status as booking_status
        FROM bookings 
        WHERE status NOT IN ('cancelled', 'checked_out') 
          AND check_in_date < ? 
          AND check_out_date > ?
        ORDER BY check_in_date ASC
      `;
      conflictsParams = [checkOut, checkIn];
    } else {
      conflictsQuery = `
        SELECT room_id, guest_name, guest_phone, booking_reference, check_in_date, check_out_date, status as booking_status
        FROM bookings 
        WHERE status IN ('confirmed', 'checked_in', 'pending') 
          AND check_in_date <= CURDATE() 
          AND check_out_date > CURDATE()
        ORDER BY check_in_date ASC
      `;
      conflictsParams = [];
    }

    const [conflicts]: any = await pool.query(conflictsQuery, conflictsParams);

    const conflictsMap = new Map<number, any>();
    for (const c of conflicts) {
      if (!conflictsMap.has(c.room_id)) {
        conflictsMap.set(c.room_id, {
          guest_name: c.guest_name,
          guest_phone: c.guest_phone,
          booking_reference: c.booking_reference,
          check_in_date: c.check_in_date instanceof Date ? c.check_in_date.toISOString().split('T')[0] : String(c.check_in_date).split('T')[0],
          check_out_date: c.check_out_date instanceof Date ? c.check_out_date.toISOString().split('T')[0] : String(c.check_out_date).split('T')[0],
          status: c.booking_status
        });
      }
    }

    // Format JSON fields and compute dynamic status & active_booking
    const formattedRooms = rows.map((r: any) => {
      const activeBooking = conflictsMap.get(r.id);
      const isReserved = Boolean(activeBooking);
      const computedStatus = r.status === 'maintenance'
        ? 'maintenance'
        : isReserved
        ? 'occupied'
        : (r.status === 'occupied' && !isReserved)
        ? 'available'
        : r.status;

      return {
        ...r,
        is_reserved: isReserved,
        status: computedStatus,
        active_booking: activeBooking || null,
        images: typeof r.images === 'string' ? JSON.parse(r.images) : r.images || [r.primary_image],
        amenities: typeof r.amenities === 'string' ? JSON.parse(r.amenities) : r.amenities || []
      };
    });

    res.json({ rooms: formattedRooms, count: formattedRooms.length });
  } catch (err: any) {
    console.error('Fetch rooms error:', err);
    res.status(500).json({ message: 'Server error fetching rooms', error: err.message });
  }
};

export const getRoomById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const [rooms]: any = await pool.query(`
      SELECT r.*, rt.name as room_type_name, rt.slug as room_type_slug, rt.bed_type 
      FROM rooms r 
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.id = ?
    `, [id]);

    if (rooms.length === 0) {
      res.status(404).json({ message: 'Room not found.' });
      return;
    }

    const room = rooms[0];
    room.images = typeof room.images === 'string' ? JSON.parse(room.images) : room.images || [room.primary_image];
    room.amenities = typeof room.amenities === 'string' ? JSON.parse(room.amenities) : room.amenities || [];

    // Fetch reviews
    const [reviews]: any = await pool.query(`
      SELECT id, guest_name, rating, comment, created_at 
      FROM reviews 
      WHERE room_id = ? AND status = 'Approved'
      ORDER BY created_at DESC LIMIT 10
    `, [id]);

    // Fetch upcoming bookings for availability check
    const [bookedDates]: any = await pool.query(`
      SELECT check_in_date, check_out_date, status 
      FROM bookings 
      WHERE room_id = ? AND status NOT IN ('cancelled') AND check_out_date >= CURDATE()
      ORDER BY check_in_date ASC
    `, [id]);

    res.json({ 
      room, 
      reviews,
      bookedDates: bookedDates.map((b: any) => ({
        checkIn: b.check_in_date instanceof Date ? b.check_in_date.toISOString().split('T')[0] : String(b.check_in_date).split('T')[0],
        checkOut: b.check_out_date instanceof Date ? b.check_out_date.toISOString().split('T')[0] : String(b.check_out_date).split('T')[0],
        status: b.status
      }))
    });
  } catch (err: any) {
    console.error('Fetch room details error:', err);
    res.status(500).json({ message: 'Server error fetching room details', error: err.message });
  }
};

export const getRoomBookedDates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [bookings]: any = await pool.query(
      `SELECT id, booking_reference, check_in_date, check_out_date, status 
       FROM bookings 
       WHERE room_id = ? AND status NOT IN ('cancelled') AND check_out_date >= CURDATE()
       ORDER BY check_in_date ASC`,
      [id]
    );

    res.json({
      roomId: id,
      bookedDates: bookings.map((b: any) => ({
        id: b.id,
        reference: b.booking_reference,
        checkIn: b.check_in_date instanceof Date ? b.check_in_date.toISOString().split('T')[0] : String(b.check_in_date).split('T')[0],
        checkOut: b.check_out_date instanceof Date ? b.check_out_date.toISOString().split('T')[0] : String(b.check_out_date).split('T')[0],
        status: b.status
      }))
    });
  } catch (err: any) {
    console.error('Fetch booked dates error:', err);
    res.status(500).json({ message: 'Server error fetching booked dates', error: err.message });
  }
};

export const getAllRoomTypes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM room_types ORDER BY base_price ASC');
    res.json({ roomTypes: rows });
  } catch (err: any) {
    res.status(500).json({ message: 'Error fetching room types', error: err.message });
  }
};

export const createRoomType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, basePrice, maxGuests, bedType = 'King Bed', sizeSqft = 400 } = req.body;
    if (!name || !basePrice) {
      res.status(400).json({ message: 'Name and basePrice are required.' });
      return;
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(100 + Math.random() * 900);
    const [result]: any = await pool.query(
      'INSERT INTO room_types (name, slug, description, base_price, max_guests, bed_type, size_sqft) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, slug, description || '', basePrice, maxGuests || 2, bedType, sizeSqft]
    );
    res.status(201).json({
      message: 'Room type created successfully.',
      roomType: { id: result.insertId, name, base_price: basePrice, max_guests: maxGuests }
    });
  } catch (err: any) {
    console.error('Create room type error:', err);
    res.status(500).json({ message: 'Error creating room type', error: err.message });
  }
};

export const updateRoomType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, basePrice, maxGuests, bedType, sizeSqft } = req.body;
    await pool.query(
      `UPDATE room_types SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        base_price = COALESCE(?, base_price),
        max_guests = COALESCE(?, max_guests),
        bed_type = COALESCE(?, bed_type),
        size_sqft = COALESCE(?, size_sqft)
      WHERE id = ?`,
      [name, description, basePrice, maxGuests, bedType, sizeSqft, id]
    );
    res.json({ message: 'Room type updated successfully.' });
  } catch (err: any) {
    console.error('Update room type error:', err);
    res.status(500).json({ message: 'Error updating room type', error: err.message });
  }
};

export const deleteRoomType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM room_types WHERE id = ?', [id]);
    res.json({ message: 'Room type deleted successfully.' });
  } catch (err: any) {
    console.error('Delete room type error:', err);
    res.status(500).json({ message: 'Error deleting room type', error: err.message });
  }
};

export const createRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      room_number,
      name,
      room_type_id,
      price_per_night,
      capacity,
      size_sqm,
      status = 'available',
      primary_image,
      images = [],
      amenities = [],
      description
    } = req.body;

    if (!room_number || !name || !price_per_night || !primary_image || !description) {
      res.status(400).json({ message: 'room_number, name, price_per_night, primary_image, and description are required.' });
      return;
    }

    const [result]: any = await pool.query(
      `INSERT INTO rooms (
        room_number, name, room_type_id, price_per_night, capacity, size_sqm, status,
        primary_image, images, amenities, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        room_number,
        name,
        room_type_id || null,
        price_per_night,
        capacity || 2,
        size_sqm || 35,
        status,
        primary_image,
        JSON.stringify(images),
        JSON.stringify(amenities),
        description
      ]
    );

    res.status(201).json({
      message: 'Room created successfully.',
      roomId: result.insertId
    });
  } catch (err: any) {
    console.error('Create room error:', err);
    res.status(500).json({ message: 'Server error creating room', error: err.message });
  }
};

export const updateRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      room_number,
      name,
      room_type_id,
      price_per_night,
      capacity,
      size_sqm,
      status,
      primary_image,
      images,
      amenities,
      description
    } = req.body;

    const [existing]: any = await pool.query('SELECT id FROM rooms WHERE id = ?', [id]);
    if (existing.length === 0) {
      res.status(404).json({ message: 'Room not found.' });
      return;
    }

    await pool.query(
      `UPDATE rooms SET 
        room_number = COALESCE(?, room_number),
        name = COALESCE(?, name),
        room_type_id = COALESCE(?, room_type_id),
        price_per_night = COALESCE(?, price_per_night),
        capacity = COALESCE(?, capacity),
        size_sqm = COALESCE(?, size_sqm),
        status = COALESCE(?, status),
        primary_image = COALESCE(?, primary_image),
        images = COALESCE(?, images),
        amenities = COALESCE(?, amenities),
        description = COALESCE(?, description)
      WHERE id = ?`,
      [
        room_number,
        name,
        room_type_id,
        price_per_night,
        capacity,
        size_sqm,
        status,
        primary_image,
        images ? JSON.stringify(images) : null,
        amenities ? JSON.stringify(amenities) : null,
        description,
        id
      ]
    );

    res.json({ message: 'Room updated successfully.' });
  } catch (err: any) {
    console.error('Update room error:', err);
    res.status(500).json({ message: 'Server error updating room', error: err.message });
  }
};

export const deleteRoom = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [result]: any = await pool.query('DELETE FROM rooms WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Room not found.' });
      return;
    }

    res.json({ message: 'Room deleted successfully.' });
  } catch (err: any) {
    console.error('Delete room error:', err);
    res.status(500).json({ message: 'Server error deleting room', error: err.message });
  }
};
