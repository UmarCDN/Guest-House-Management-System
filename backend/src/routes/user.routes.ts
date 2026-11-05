import { Router } from 'express';
import {
  getAllGuests,
  createGuest,
  updateGuest,
  deleteGuest,
  updateProfile
} from '../controllers/user.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Guest management routes (Admin and Staff)
router.get('/guests', authenticateToken, requireRole(['admin', 'staff']), getAllGuests);
router.post('/guests', authenticateToken, requireRole(['admin', 'staff']), createGuest);
router.put('/guests/:id', authenticateToken, requireRole(['admin', 'staff']), updateGuest);
router.delete('/guests/:id', authenticateToken, requireRole(['admin']), deleteGuest);

// Protected: current user
router.put('/profile', authenticateToken, updateProfile);

export default router;
