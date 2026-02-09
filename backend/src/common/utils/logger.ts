import winston from 'winston';
import { config, isDevelopment, isTest } from '@config/index';

/**
 * Structured logger using winston.
 *
 * - Development: colorized, human-readable console output
 * - Production: JSON-formatted for log aggregation (ELK, Datadog, etc.)
 * - Test: silent (no output during tests)
 *
 * Usage:
 *   import { logger } from '@common/utils/logger';
 *   logger.info('Server started', { port: 4000 });
 *   logger.error('Failed to process', { error: err.message, stack: err.stack });
 */

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Human-readable format for development
const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'HH:mm:ss.SSS' }),
  errors({ stack: true }),
  printf(({ timestamp: ts, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    const stackStr = stack ? `\n${String(stack)}` : '';
    return `${String(ts)} [${level}] ${String(message)}${metaStr}${stackStr}`;
  }),
);

// JSON format for production (structured logging)
const prodFormat = combine(timestamp({ format: 'ISO' }), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: config.LOG_LEVEL ?? (isDevelopment ? 'debug' : 'info'),
  defaultMeta: { service: 'car-workshop-api' },
  format: isDevelopment ? devFormat : prodFormat,
  transports: [
    new winston.transports.Console({
      silent: isTest,
    }),
  ],
  // Don't exit on unhandled error logs
  exitOnError: false,
});

/**
 * Morgan-compatible stream that writes HTTP request logs through winston.
 */
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
