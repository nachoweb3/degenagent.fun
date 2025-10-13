import { Router } from 'express';
import {
  getCurrentOlympics,
  getLeaderboard,
  enterOlympics,
  createOlympics
} from '../controllers/olympicsController';

const router = Router();

// Get current active Olympics
router.get('/current', getCurrentOlympics);

// Get leaderboard for a specific Olympics
router.get('/:olympicsId/leaderboard', getLeaderboard);

// Enter an agent into Olympics
router.post('/:olympicsId/enter', enterOlympics);

// Create new Olympics (admin)
router.post('/create', createOlympics);

export default router;
