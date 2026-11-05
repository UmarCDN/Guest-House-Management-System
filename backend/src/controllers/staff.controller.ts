import { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const getAllStaff = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM staff ORDER BY id ASC');
    res.json({
      staff: rows.map((s: any) => ({
        id: String(s.id),
        name: s.name,
        email: s.email,
        phone: s.phone,
        role: s.role,
        department: s.department,
        shift: s.shift,
        salary: Number(s.salary),
        status: s.status,
        joinedDate: s.joined_date instanceof Date ? s.joined_date.toISOString().split('T')[0] : String(s.joined_date || '').split('T')[0]
      }))
    });
  } catch (err: any) {
    console.error('Fetch staff error:', err);
    res.status(500).json({ message: 'Error fetching staff members', error: err.message });
  }
};

export const createStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, role, department, shift = 'Morning', salary = 0, joinedDate } = req.body;
    if (!name || !email || !phone || !role) {
      res.status(400).json({ message: 'name, email, phone, and role are required.' });
      return;
    }

    const dept = department || (role === 'Receptionist' ? 'Front Desk' : role === 'Housekeeping' ? 'Housekeeping' : 'Administration');

    const [result]: any = await pool.query(
      `INSERT INTO staff (name, email, phone, role, department, shift, salary, status, joined_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', ?)`,
      [name, email, phone, role, dept, shift, salary, joinedDate || new Date().toISOString().split('T')[0]]
    );

    res.status(201).json({
      message: 'Staff member created successfully.',
      staff: {
        id: String(result.insertId),
        name,
        email,
        phone,
        role,
        department,
        shift,
        salary,
        status: 'Active',
        joinedDate: joinedDate || new Date().toISOString().split('T')[0]
      }
    });
  } catch (err: any) {
    console.error('Create staff error:', err);
    res.status(500).json({ message: 'Error creating staff member', error: err.message });
  }
};

export const updateStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, department, shift, salary, status } = req.body;

    const [result]: any = await pool.query(
      `UPDATE staff SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        role = COALESCE(?, role),
        department = COALESCE(?, department),
        shift = COALESCE(?, shift),
        salary = COALESCE(?, salary),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [name, email, phone, role, department, shift, salary, status, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Staff member not found.' });
      return;
    }

    const [rows]: any = await pool.query('SELECT * FROM staff WHERE id = ?', [id]);
    res.json({ message: 'Staff member updated successfully.', staff: rows[0] });
  } catch (err: any) {
    console.error('Update staff error:', err);
    res.status(500).json({ message: 'Error updating staff member', error: err.message });
  }
};

export const deleteStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [result]: any = await pool.query('DELETE FROM staff WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Staff member not found.' });
      return;
    }

    res.json({ message: 'Staff member deleted successfully.' });
  } catch (err: any) {
    console.error('Delete staff error:', err);
    res.status(500).json({ message: 'Error deleting staff member', error: err.message });
  }
};

export const toggleStaffStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query('SELECT status FROM staff WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Staff member not found.' });
      return;
    }

    const newStatus = rows[0].status === 'Active' ? 'Inactive' : 'Active';
    await pool.query('UPDATE staff SET status = ? WHERE id = ?', [newStatus, id]);

    res.json({ message: 'Staff status updated.', status: newStatus });
  } catch (err: any) {
    console.error('Toggle staff status error:', err);
    res.status(500).json({ message: 'Error toggling staff status', error: err.message });
  }
};
