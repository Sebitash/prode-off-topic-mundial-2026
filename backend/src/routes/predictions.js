import { Router } from 'express';
import { getUserPredictions, getPredictionsByUserId, upsertPrediction, deletePrediction } from '../controllers/predictionsController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getUserPredictions);
router.get('/user/:userId', authenticate, getPredictionsByUserId);
router.post('/', authenticate, upsertPrediction);
router.delete('/:matchId', authenticate, deletePrediction);

export default router;
