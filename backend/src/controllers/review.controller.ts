import { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const getAllReviews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`
      SELECT rv.*, r.name as room_name, r.room_number 
      FROM reviews rv 
      JOIN rooms r ON rv.room_id = r.id 
      ORDER BY rv.created_at DESC
    `);

    res.json({
      reviews: rows.map((r: any) => ({
        id: String(r.id),
        roomId: String(r.room_id),
        roomName: r.room_name,
        roomNumber: r.room_number,
        guestName: r.guest_name,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        date: r.created_at instanceof Date ? r.created_at.toISOString().split('T')[0] : String(r.created_at || '').split('T')[0]
      }))
    });
  } catch (err: any) {
    console.error('Fetch reviews error:', err);
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
};

export const getApprovedReviews = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`
      SELECT rv.*, r.name as room_name, r.room_number 
      FROM reviews rv 
      JOIN rooms r ON rv.room_id = r.id 
      WHERE rv.status = 'Approved'
      ORDER BY rv.created_at DESC
    `);

    res.json({
      reviews: rows.map((r: any) => ({
        id: String(r.id),
        roomId: String(r.room_id),
        roomName: r.room_name,
        roomNumber: r.room_number,
        guestName: r.guest_name,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        date: r.created_at instanceof Date ? r.created_at.toISOString().split('T')[0] : String(r.created_at || '').split('T')[0]
      }))
    });
  } catch (err: any) {
    console.error('Fetch approved reviews error:', err);
    res.status(500).json({ message: 'Error fetching approved reviews', error: err.message });
  }
};

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId, guestName, rating, comment } = req.body;
    if (!roomId || !guestName || !rating || !comment) {
      res.status(400).json({ message: 'roomId, guestName, rating, and comment are required.' });
      return;
    }

    const [result]: any = await pool.query(
      'INSERT INTO reviews (room_id, guest_name, rating, comment, status) VALUES (?, ?, ?, ?, "Pending")',
      [roomId, guestName, rating, comment]
    );

    res.status(201).json({
      message: 'Thank you! Your review has been submitted for moderation.',
      reviewId: result.insertId
    });
  } catch (err: any) {
    console.error('Create review error:', err);
    res.status(500).json({ message: 'Error submitting review', error: err.message });
  }
};

export const updateReviewStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Pending', 'Rejected'].includes(status)) {
      res.status(400).json({ message: 'Invalid review status.' });
      return;
    }

    const [result]: any = await pool.query('UPDATE reviews SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Review not found.' });
      return;
    }

    res.json({ message: 'Review status updated successfully.', status });
  } catch (err: any) {
    console.error('Update review status error:', err);
    res.status(500).json({ message: 'Error updating review status', error: err.message });
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [result]: any = await pool.query('DELETE FROM reviews WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Review not found.' });
      return;
    }

    res.json({ message: 'Review deleted successfully.' });
  } catch (err: any) {
    console.error('Delete review error:', err);
    res.status(500).json({ message: 'Error deleting review', error: err.message });
  }
};
