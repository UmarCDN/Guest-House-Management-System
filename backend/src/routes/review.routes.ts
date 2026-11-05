import { Router } from 'express';
import { 
  getAllReviews, 
  getApprovedReviews, 
  createReview, 
  updateReviewStatus, 
  deleteReview 
} from '../controllers/review.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public
router.get('/approved', getApprovedReviews);
router.post('/', createReview);

// Admin
router.get('/', authenticateToken, requireRole(['admin']), getAllReviews);
router.patch('/:id/status', authenticateToken, requireRole(['admin']), updateReviewStatus);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteReview);

export default router;
