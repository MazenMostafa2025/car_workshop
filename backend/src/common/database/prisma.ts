import { PrismaClient } from '@prisma/client';
import { isDevelopment } from '@config/index';
import { logger } from '@common/utils/logger';

/**
 * Singleton PrismaClient.
 *
 * - Only ONE instance is ever created (connection pooling by default).
 * - Logs queries through winston in development for debugging.
 * - Handles graceful shutdown.
 *
 * Usage:
 *   import { prisma } from '@common/database/prisma';
 *   const users = await prisma.user.findMany();
 */
class Database {
  private static instance: PrismaClient | null = null;

  private constructor() {
    // Private — prevent direct instantiation
  }

  /**
   * Get or create the singleton PrismaClient instance.
   */
  static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log: isDevelopment
          ? [
              { emit: 'event', level: 'query' },
              { emit: 'event', level: 'warn' },
              { emit: 'event', level: 'error' },
            ]
          : [{ emit: 'event', level: 'error' }],
      });

      // Pipe Prisma log events through winston
      Database.instance.$on('query' as never, (e: unknown) => {
        const event = e as { query: string; duration: number };
        logger.debug('Prisma Query', {
          query: event.query,
          duration: `${String(event.duration)}ms`,
        });
      });

      Database.instance.$on('warn' as never, (e: unknown) => {
        const event = e as { message: string };
        logger.warn('Prisma Warning', { message: event.message });
      });

      Database.instance.$on('error' as never, (e: unknown) => {
        const event = e as { message: string };
        logger.error('Prisma Error', { message: event.message });
      });
    }
    return Database.instance;
  }

  /**
   * Gracefully disconnect from the database.
   * Call this on application shutdown.
   */
  static async disconnect(): Promise<void> {
    if (Database.instance) {
      await Database.instance.$disconnect();
      Database.instance = null;
      logger.info('Database connection closed.');
    }
  }
}

export const prisma = Database.getInstance();
export default Database;
