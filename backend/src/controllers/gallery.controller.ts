import { Request, Response } from 'express';
import { pool } from '../config/db.js';

export const getAllGallery = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM gallery ORDER BY is_featured DESC, created_at DESC');
    res.json({
      gallery: rows.map((g: any) => ({
        id: String(g.id),
        title: g.title,
        category: g.category,
        imageUrl: g.image_url,
        isFeatured: Boolean(g.is_featured),
        uploadedAt: g.created_at instanceof Date ? g.created_at.toISOString().split('T')[0] : String(g.created_at || '').split('T')[0]
      }))
    });
  } catch (err: any) {
    console.error('Fetch gallery error:', err);
    res.status(500).json({ message: 'Error fetching gallery items', error: err.message });
  }
};

export const createGalleryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, category = 'Rooms', imageUrl, isFeatured = false } = req.body;
    if (!title || !imageUrl) {
      res.status(400).json({ message: 'Title and imageUrl are required.' });
      return;
    }

    const [result]: any = await pool.query(
      'INSERT INTO gallery (title, category, image_url, is_featured) VALUES (?, ?, ?, ?)',
      [title, category, imageUrl, isFeatured]
    );

    res.status(201).json({
      message: 'Gallery item created successfully.',
      galleryItem: {
        id: String(result.insertId),
        title,
        category,
        imageUrl,
        isFeatured,
        uploadedAt: new Date().toISOString().split('T')[0]
      }
    });
  } catch (err: any) {
    console.error('Create gallery item error:', err);
    res.status(500).json({ message: 'Error creating gallery item', error: err.message });
  }
};

export const deleteGalleryItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [result]: any = await pool.query('DELETE FROM gallery WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Gallery item not found.' });
      return;
    }

    res.json({ message: 'Gallery item deleted successfully.' });
  } catch (err: any) {
    console.error('Delete gallery item error:', err);
    res.status(500).json({ message: 'Error deleting gallery item', error: err.message });
  }
};

export const toggleGalleryFeatured = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query('SELECT is_featured FROM gallery WHERE id = ?', [id]);
    if (rows.length === 0) {
      res.status(404).json({ message: 'Gallery item not found.' });
      return;
    }

    const newFeatured = !rows[0].is_featured;
    await pool.query('UPDATE gallery SET is_featured = ? WHERE id = ?', [newFeatured, id]);

    res.json({ message: 'Gallery featured status updated.', isFeatured: newFeatured });
  } catch (err: any) {
    console.error('Toggle gallery featured error:', err);
    res.status(500).json({ message: 'Error updating gallery featured status', error: err.message });
  }
};
