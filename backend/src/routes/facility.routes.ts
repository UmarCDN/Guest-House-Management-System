import { Router } from 'express';
import { 
  getAllFacilities, 
  createFacility, 
  updateFacility, 
  deleteFacility, 
  toggleFacilityStatus 
} from '../controllers/facility.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public
router.get('/', getAllFacilities);

// Admin-only management
router.post('/', authenticateToken, requireRole(['admin']), createFacility);
router.put('/:id', authenticateToken, requireRole(['admin']), updateFacility);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteFacility);
router.patch('/:id/toggle', authenticateToken, requireRole(['admin']), toggleFacilityStatus);

export default router;
