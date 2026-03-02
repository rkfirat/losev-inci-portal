import { Router } from 'express';
import { getAllBadges, getUserBadges } from '../controllers/badge.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAllBadges);
router.get('/my', getUserBadges);

export default router;
