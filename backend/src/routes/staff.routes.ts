import { Router } from 'express';
import { 
  getAllStaff, 
  createStaff, 
  updateStaff, 
  deleteStaff, 
  toggleStaffStatus 
} from '../controllers/staff.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Protected: Admin only
router.get('/', authenticateToken, requireRole(['admin']), getAllStaff);
router.post('/', authenticateToken, requireRole(['admin']), createStaff);
router.put('/:id', authenticateToken, requireRole(['admin']), updateStaff);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteStaff);
router.patch('/:id/toggle', authenticateToken, requireRole(['admin']), toggleStaffStatus);

export default router;
