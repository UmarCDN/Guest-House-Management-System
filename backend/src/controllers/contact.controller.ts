import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const submitContactMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ message: 'Name, email, and message are required.' });
      return;
    }

    const [result]: any = await pool.query(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, subject || 'General Inquiry', message]
    );

    res.status(201).json({
      message: 'Your inquiry has been delivered to our concierge team. We will reply shortly!',
      id: result.insertId
    });
  } catch (err: any) {
    console.error('Submit contact message error:', err);
    res.status(500).json({ message: 'Server error saving inquiry', error: err.message });
  }
};

export const getAllContactMessages = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json({ messages: rows });
  } catch (err: any) {
    console.error('Fetch contact messages error:', err);
    res.status(500).json({ message: 'Error retrieving messages', error: err.message });
  }
};
