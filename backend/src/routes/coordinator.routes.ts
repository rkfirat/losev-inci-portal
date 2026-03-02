import { Router } from 'express';
import coordinatorController from '../controllers/coordinator.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { isCoordinator } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateVolunteerHourStatusSchema } from '../utils/validations';

const router = Router();

// Only coordinators and admins can access these
router.use(authenticate, isCoordinator);

router.get('/hours/pending', coordinatorController.getPendingHours);
router.patch('/hours/:id/status', validate(updateVolunteerHourStatusSchema), coordinatorController.updateHourStatus);

export default router;
