import { Router } from 'express';
import { register, login, refresh, logout, get42AuthUrl, handle42Callback, me, updatePushToken } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { registerSchema, loginSchema, refreshSchema, updatePushTokenSchema } from '../utils/validations';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshSchema), refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);
router.patch('/push-token', authenticate, validate(updatePushTokenSchema), updatePushToken);

// 42 OAuth
router.get('/42', get42AuthUrl);
router.get('/42/callback', handle42Callback);

export default router;
