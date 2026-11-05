import { Router } from 'express';
import { 
  createBooking, 
  getAllBookings, 
  getMyBookings, 
  getBookingById, 
  updateBookingStatus, 
  cancelBooking 
} from '../controllers/booking.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Protected: any authenticated user
router.post('/', authenticateToken, createBooking);
router.get('/my', authenticateToken, getMyBookings);
router.get('/:id', authenticateToken, getBookingById);
router.post('/:id/cancel', authenticateToken, cancelBooking);

// Protected: admin only
router.get('/', authenticateToken, requireRole(['admin']), getAllBookings);
router.patch('/:id/status', authenticateToken, requireRole(['admin']), updateBookingStatus);

export default router;
