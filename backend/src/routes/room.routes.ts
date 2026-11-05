import { Router } from 'express';
import { 
  getAllRooms, 
  getRoomById, 
  getRoomBookedDates,
  getAllRoomTypes,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  createRoom, 
  updateRoom, 
  deleteRoom 
} from '../controllers/room.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getAllRooms);
router.get('/types', getAllRoomTypes);
router.get('/:id', getRoomById);
router.get('/:id/booked-dates', getRoomBookedDates);

// Admin-only management routes
router.post('/types', authenticateToken, requireRole(['admin']), createRoomType);
router.put('/types/:id', authenticateToken, requireRole(['admin']), updateRoomType);
router.delete('/types/:id', authenticateToken, requireRole(['admin']), deleteRoomType);

router.post('/', authenticateToken, requireRole(['admin']), createRoom);
router.put('/:id', authenticateToken, requireRole(['admin']), updateRoom);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteRoom);

export default router;
