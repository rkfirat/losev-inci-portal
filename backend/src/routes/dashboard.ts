import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import * as ctrl from '../controllers/dashboard.controller';

const router = Router();

router.use(authenticate);
router.get('/', ctrl.getDashboard);

export { router as dashboardRouter };
