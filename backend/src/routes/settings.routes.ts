import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public / Authenticated read
router.get('/', getSettings);

// Admin-only write
router.put('/', authenticateToken, requireRole(['admin']), updateSettings);

export default router;
