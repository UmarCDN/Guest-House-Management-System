import { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const getAllFacilities = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM facilities ORDER BY id ASC');
    res.json({ facilities: rows });
  } catch (err: any) {
    console.error('Fetch facilities error:', err);
    res.status(500).json({ message: 'Error fetching facilities', error: err.message });
  }
};

export const createFacility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, icon, description, status = 'Enabled' } = req.body;
    if (!name || !icon) {
      res.status(400).json({ message: 'Facility name and icon are required.' });
      return;
    }

    const [result]: any = await pool.query(
      'INSERT INTO facilities (name, icon, description, status) VALUES (?, ?, ?, ?)',
      [name, icon, description || '', status]
    );

    res.status(201).json({
      message: 'Facility created successfully.',
      facility: { id: result.insertId, name, icon, description, status }
    });
  } catch (err: any) {
    console.error('Create facility error:', err);
    res.status(500).json({ message: 'Error creating facility', error: err.message });
  }
};

export const updateFacility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, icon, description, status } = req.body;

    const [result]: any = await pool.query(
      `UPDATE facilities SET
        name = COALESCE(?, name),
        icon = COALESCE(?, icon),
        description = COALESCE(?, description),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [name, icon, description, status, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Facility not found.' });
      return;
    }

    const [rows]: any = await pool.query('SELECT * FROM facilities WHERE id = ?', [id]);
    res.json({ message: 'Facility updated successfully.', facility: rows[0] });
  } catch (err: any) {
    console.error('Update facility error:', err);
    res.status(500).json({ message: 'Error updating facility', error: err.message });
  }
};

export const deleteFacility = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [result]: any = await pool.query('DELETE FROM facilities WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Facility not found.' });
      return;
    }

    res.json({ message: 'Facility deleted successfully.' });
  } catch (err: any) {
    console.error('Delete facility error:', err);
    res.status(500).json({ message: 'Error deleting facility', error: err.message });
  }
};

export const toggleFacilityStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query('SELECT status FROM facilities WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Facility not found.' });
      return;
    }

    const newStatus = rows[0].status === 'Enabled' ? 'Disabled' : 'Enabled';
    await pool.query('UPDATE facilities SET status = ? WHERE id = ?', [newStatus, id]);

    res.json({ message: 'Facility status updated.', status: newStatus });
  } catch (err: any) {
    console.error('Toggle facility error:', err);
    res.status(500).json({ message: 'Error toggling facility status', error: err.message });
  }
};
