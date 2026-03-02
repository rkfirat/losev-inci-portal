import { Router } from 'express';
import eventController from '../controllers/event.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { eventIdParamSchema } from '../utils/validations';

const router = Router();

router.get('/', eventController.getAllEvents);
router.get('/:id', authenticate, validate(eventIdParamSchema), eventController.getEventById);
router.post('/:id/participate', authenticate, validate(eventIdParamSchema), eventController.participate);
router.delete('/:id/participate', authenticate, validate(eventIdParamSchema), eventController.cancelParticipation);

export default router;
