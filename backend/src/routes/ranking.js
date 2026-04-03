import { Router } from 'express';
import { getRanking } from '../controllers/rankingController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getRanking);

export default router;
