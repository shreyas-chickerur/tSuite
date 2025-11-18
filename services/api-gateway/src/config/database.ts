import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
});

// Prisma event types
interface QueryEvent {
  query: string;
  duration: number;
}

interface ErrorEvent {
  message: string;
  target?: string;
}

interface WarnEvent {
  message: string;
}

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: QueryEvent) => {
    logger.debug('Query: ' + e.query);
    logger.debug('Duration: ' + e.duration + 'ms');
  });
}

prisma.$on('error', (e: ErrorEvent) => {
  logger.error('Database error:', e);
});

prisma.$on('warn', (e: WarnEvent) => {
  logger.warn('Database warning:', e);
});

export { prisma };
