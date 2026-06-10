import { Router } from 'express';
import { getMatches, getMatchById, getGroups, getTeams, getGroupsSimple, updateMatchResult } from '../controllers/matchesController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, getMatches);
router.get('/groups', authenticate, getGroups);
router.get('/groups-simple', authenticate, getGroupsSimple);
router.get('/teams', authenticate, getTeams);
router.get('/:id', authenticate, getMatchById);
router.patch('/:id/result', authenticate, requireAdmin, updateMatchResult);

export default router;
