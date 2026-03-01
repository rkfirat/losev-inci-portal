import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import * as ctrl from '../controllers/badge.controller';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.listBadges);
router.get('/me', ctrl.getMyBadges);
router.get('/:id', ctrl.getBadgeDetail);

export { router as badgesRouter };
