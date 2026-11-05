import { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const getAllPayments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query(`
      SELECT p.*, b.booking_reference 
      FROM payments p 
      LEFT JOIN bookings b ON p.booking_id = b.id 
      ORDER BY p.created_at DESC
    `);

    res.json({
      payments: rows.map((p: any) => ({
        id: p.payment_reference || `PAY-${p.id}`,
        bookingId: p.booking_reference || (p.booking_id ? `GH-2026-${p.booking_id}` : 'Direct'),
        guestName: p.guest_name,
        amount: Number(p.amount),
        paymentMethod: p.payment_method || 'Cash at Counter',
        method: p.payment_method || 'Cash at Counter',
        transactionRef: p.payment_reference || `TXN-${p.id}`,
        status: p.status ? (p.status.charAt(0).toUpperCase() + p.status.slice(1).toLowerCase()) : 'Paid',
        date: p.created_at instanceof Date ? p.created_at.toISOString().split('T')[0] : String(p.created_at || '').split('T')[0].split(' ')[0]
      }))
    });
  } catch (err: any) {
    console.error('Fetch payments error:', err);
    res.status(500).json({ message: 'Error fetching payments', error: err.message });
  }
};

export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookingId, guestName, amount, method, status = 'Paid' } = req.body;
    if (!guestName || !amount || !method) {
      res.status(400).json({ message: 'guestName, amount, and method are required.' });
      return;
    }

    const paymentRef = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;

    const [result]: any = await pool.query(
      `INSERT INTO payments (payment_reference, guest_name, amount, payment_method, status)
       VALUES (?, ?, ?, ?, ?)`,
      [paymentRef, guestName, amount, method, status]
    );

    res.status(201).json({
      message: 'Payment recorded successfully.',
      payment: {
        id: paymentRef,
        bookingId: bookingId || 'Direct',
        guestName,
        amount: Number(amount),
        method,
        status,
        date: new Date().toISOString().split('T')[0]
      }
    });
  } catch (err: any) {
    console.error('Create payment error:', err);
    res.status(500).json({ message: 'Error recording payment', error: err.message });
  }
};
