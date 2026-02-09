import rateLimit from 'express-rate-limit';
import { config } from '@config/index';

/**
 * Global rate limiter — applied to all routes.
 */
export const globalRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});

/**
 * Strict rate limiter for auth endpoints — 10 requests per minute in dev, per 15 min in prod.
 */
export const authRateLimiter = rateLimit({
  windowMs: config.NODE_ENV === 'development' ? 60 * 1000 : 15 * 60 * 1000,
  max: config.NODE_ENV === 'development' ? 30 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
});
