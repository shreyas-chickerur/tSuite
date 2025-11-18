import app from './app';
import { config } from './config';
import { logger } from './config/logger';
import { prisma } from './config/database';
import { redis } from './config/redis';

const startServer = async () => {
  try {
    // Test Redis connection
    await redis.ping();
    logger.info('Redis connected successfully');
    
    // Database will connect lazily on first query
    logger.info('Database connection configured');

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
      logger.info(`API version: ${config.apiVersion}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        await prisma.$disconnect();
        logger.info('Database disconnected');
        
        redis.disconnect();
        logger.info('Redis disconnected');
        
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
