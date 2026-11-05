import { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query('SELECT category, setting_key, setting_value FROM settings');
    
    // Map key-values into grouped object
    const settingsObj: any = {
      general: {},
      booking: {},
      payment: {}
    };

    rows.forEach((row: any) => {
      const cat = row.category || 'general';
      if (!settingsObj[cat]) settingsObj[cat] = {};
      
      // Parse numeric or boolean values
      let val: any = row.setting_value;
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (!isNaN(Number(val)) && val.trim() !== '') val = Number(val);

      settingsObj[cat][row.setting_key] = val;
    });

    res.json({ settings: settingsObj });
  } catch (err: any) {
    console.error('Fetch settings error:', err);
    res.status(500).json({ message: 'Error fetching settings', error: err.message });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const updates = req.body; // e.g. { general: {...}, booking: {...}, payment: {...} }

    for (const [category, keys] of Object.entries(updates)) {
      if (typeof keys === 'object' && keys !== null) {
        for (const [key, value] of Object.entries(keys)) {
          await pool.query(
            `INSERT INTO settings (category, setting_key, setting_value) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
            [category, key, String(value)]
          );
        }
      }
    }

    res.json({ message: 'Settings saved successfully.' });
  } catch (err: any) {
    console.error('Update settings error:', err);
    res.status(500).json({ message: 'Error updating settings', error: err.message });
  }
};
