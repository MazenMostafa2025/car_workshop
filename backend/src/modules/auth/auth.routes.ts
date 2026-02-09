import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '@common/middlewares/authenticate';
import { validate } from '@common/middlewares/validate';
import { authRateLimiter } from '@common/middlewares/rateLimiter';
import { registerSchema, loginSchema, changePasswordSchema } from './auth.validation';

const router = Router();

/**
 * Auth Routes
 *
 * POST   /api/v1/auth/register         — Register new user (rate-limited)
 * POST   /api/v1/auth/login            — Login (rate-limited)
 * GET    /api/v1/auth/me               — Get current user profile (authenticated)
 * PATCH  /api/v1/auth/change-password   — Change password (authenticated)
 */

/* eslint-disable @typescript-eslint/no-misused-promises */
router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.getProfile);
router.patch(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);
/* eslint-enable @typescript-eslint/no-misused-promises */

export default router;
