import { Router } from 'express';
import { getMatches, getMatchById, getGroups, getTeams, getGroupsSimple } from '../controllers/matchesController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getMatches);
router.get('/groups', authenticate, getGroups);
router.get('/groups-simple', authenticate, getGroupsSimple);
router.get('/teams', authenticate, getTeams);
router.get('/:id', authenticate, getMatchById);

export default router;
