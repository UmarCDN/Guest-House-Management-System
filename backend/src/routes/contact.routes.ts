import { Router } from 'express';
import { submitContactMessage, getAllContactMessages } from '../controllers/contact.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public contact submission
router.post('/', submitContactMessage);

// Admin review
router.get('/', authenticateToken, requireRole(['admin']), getAllContactMessages);

export default router;
