import { Router } from 'express';
import { signup, login, googleAuth, resetPassword } from '../controllers/authController.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/reset-password', resetPassword);

export default router;
