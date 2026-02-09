import morgan from 'morgan';
import { isDevelopment } from '@config/index';
import { morganStream } from '@common/utils/logger';

/**
 * HTTP request logger middleware.
 *
 * Pipes all HTTP request logs through winston for consistent structured logging.
 *
 * - Development: 'dev' format (concise colored output via winston console)
 * - Production: 'combined' format (full Apache combined log, JSON via winston)
 */
export const requestLogger = morgan(isDevelopment ? 'dev' : 'combined', {
  stream: morganStream,
});
