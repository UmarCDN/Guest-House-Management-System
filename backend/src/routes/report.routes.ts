import { Router } from 'express';
import { getRevenueReport } from '../controllers/report.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Financial reports accessible by admin and staff
router.get('/revenue', authenticateToken, requireRole(['admin', 'staff']), getRevenueReport);

export default router;
