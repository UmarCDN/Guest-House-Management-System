import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Protected: admin only
router.get('/stats', authenticateToken, requireRole(['admin']), getDashboardStats);

export default router;
