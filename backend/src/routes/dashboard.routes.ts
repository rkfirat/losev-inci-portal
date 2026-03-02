import { Router } from 'express';
import { getDashboard, getAdminDashboard } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { isCoordinator } from '../middlewares/role.middleware';

const router = Router();

router.get('/', authenticate, getDashboard);
router.get('/admin', authenticate, isCoordinator, getAdminDashboard);

export default router;
