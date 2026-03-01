import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createEventSchema } from '../validators/event';
import * as ctrl from '../controllers/event.controller';

const router = Router();

router.use(authenticate);

router.get('/', ctrl.listEvents);
router.get('/:id', ctrl.getEventDetail);
router.post('/', requireRole('TEACHER', 'ADMIN'), validate(createEventSchema), ctrl.createEvent);
router.post('/:id/participate', ctrl.participateEvent);
router.delete('/:id/participate', ctrl.cancelParticipation);

export { router as eventsRouter };
