import app from './app';
import { config } from '@config/index';
import Database from '@common/database/prisma';
import { logger } from '@common/utils/logger';

/**
 * Application entry point.
 *
 * Starts the HTTP server and handles graceful shutdown.
 */
function main(): void {
  const server = app.listen(config.PORT, () => {
    logger.info(`Car Workshop API started`, {
      port: config.PORT,
      environment: config.NODE_ENV,
      url: `http://localhost:${String(config.PORT)}`,
      docs: `http://localhost:${String(config.PORT)}/api/docs`,
    });
  });

  // ============================================
  // GRACEFUL SHUTDOWN
  // ============================================

  const shutdown = (signal: string): void => {
    logger.info('Graceful shutdown initiated', { signal });

    server.close(() => {
      logger.info('HTTP server closed.');
      void Database.disconnect().then(() => {
        process.exit(0);
      });
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => {
    shutdown('SIGTERM');
  });
  process.on('SIGINT', () => {
    shutdown('SIGINT');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: Error) => {
    logger.error('Unhandled Rejection', { message: reason.message, stack: reason.stack });
    throw reason;
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', { message: error.message, stack: error.stack });
    process.exit(1);
  });
}

try {
  main();
} catch (err) {
  logger.error('Failed to start server', { error: err });
  process.exit(1);
}
