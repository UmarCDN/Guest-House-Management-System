import { Router } from 'express';
import { getAllPayments, createPayment } from '../controllers/payment.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Protected: Admin
router.get('/', authenticateToken, requireRole(['admin']), getAllPayments);
router.post('/', authenticateToken, requireRole(['admin']), createPayment);

export default router;
