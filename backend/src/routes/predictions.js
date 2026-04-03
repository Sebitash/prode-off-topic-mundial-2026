import { Router } from 'express';
import { getUserPredictions, upsertPrediction } from '../controllers/predictionsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getUserPredictions);
router.post('/', authenticate, upsertPrediction);

export default router;
