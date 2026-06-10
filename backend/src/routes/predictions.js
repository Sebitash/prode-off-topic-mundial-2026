import { Router } from 'express';
import { getUserPredictions, upsertPrediction, deletePrediction } from '../controllers/predictionsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getUserPredictions);
router.post('/', authenticate, upsertPrediction);
router.delete('/:matchId', authenticate, deletePrediction);

export default router;
