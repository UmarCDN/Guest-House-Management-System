import { Response } from 'express';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const getAllGuests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.avatar, u.created_at,
             COUNT(b.id) as total_bookings,
             COALESCE(SUM(b.total_price), 0) as total_spent
      FROM users u
      LEFT JOIN bookings b ON u.id = b.user_id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({ guests: rows, count: rows.length });
  } catch (err: any) {
    console.error('Fetch guests error:', err);
    res.status(500).json({ message: 'Server error fetching guests list', error: err.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const { name, phone, avatar } = req.body;

    await pool.query(
      `UPDATE users SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        avatar = COALESCE(?, avatar)
      WHERE id = ?`,
      [name, phone, avatar, userId]
    );

    const [rows]: any = await pool.query('SELECT id, name, email, role, phone, avatar FROM users WHERE id = ?', [userId]);

    res.json({ message: 'Profile updated successfully.', user: rows[0] });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error updating profile', error: err.message });
  }
};

export const createGuest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      res.status(400).json({ message: 'Name and email are required.' });
      return;
    }
    const [existing]: any = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      res.status(409).json({ message: 'A guest with this email already exists.' });
      return;
    }
    const bcrypt = await import('bcryptjs');
    const hash = await bcrypt.default.hash('guest123', 10);
    const [result]: any = await pool.query(
      "INSERT INTO users (name, email, password, role, phone) VALUES (?, ?, ?, 'customer', ?)",
      [name, email, hash, phone || null]
    );
    res.status(201).json({
      message: 'Guest profile created successfully.',
      guest: { id: result.insertId, name, email, phone, role: 'customer' }
    });
  } catch (err: any) {
    console.error('Create guest error:', err);
    res.status(500).json({ message: 'Error creating guest', error: err.message });
  }
};

export const updateGuest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;
    await pool.query(
      `UPDATE users SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone)
      WHERE id = ? AND role = 'customer'`,
      [name, phone, id]
    );
    res.json({ message: 'Guest updated successfully.' });
  } catch (err: any) {
    console.error('Update guest error:', err);
    res.status(500).json({ message: 'Error updating guest', error: err.message });
  }
};

export const deleteGuest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = ? AND role = 'customer'", [id]);
    res.json({ message: 'Guest deleted successfully.' });
  } catch (err: any) {
    console.error('Delete guest error:', err);
    res.status(500).json({ message: 'Error deleting guest', error: err.message });
  }
};
