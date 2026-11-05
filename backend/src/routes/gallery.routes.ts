import { Router } from 'express';
import { 
  getAllGallery, 
  createGalleryItem, 
  deleteGalleryItem, 
  toggleGalleryFeatured 
} from '../controllers/gallery.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public
router.get('/', getAllGallery);

// Admin
router.post('/', authenticateToken, requireRole(['admin']), createGalleryItem);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteGalleryItem);
router.patch('/:id/featured', authenticateToken, requireRole(['admin']), toggleGalleryFeatured);

export default router;
