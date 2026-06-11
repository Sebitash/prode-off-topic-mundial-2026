import { Router } from 'express';
import { getMe, updateTheme } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/me', authenticate, getMe);
router.patch('/theme', authenticate, updateTheme);

export default router;
