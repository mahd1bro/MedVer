import fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { Logger } from '@/utils/logger';
import { healthRoutes } from '@/routes/health';
import { searchRoutes } from '@/routes/search';
import { verifyRoutes } from '@/routes/verify';

// Create Fastify instance
const app = fastify({
  logger: false, // We use our own logger
  trustProxy: true,
});

// Register plugins
app.register(cors, {
  origin: process.env.CORS_ORIGIN || '*', // Configure appropriately for production
  credentials: false,
});

// Rate limiting
app.register(rateLimit, {
  max: 100, // Maximum requests per window
  timeWindow: '1 minute', // Time window
  errorResponseBuilder: (request, context) => ({
    error: 'Too Many Requests',
    message: `Rate limit exceeded, retry in ${context.after}`,
    statusCode: 429,
  }),
});

// Add request ID for tracking
app.addHook('onRequest', async (request, reply) => {
  request.id = Math.random().toString(36).substring(2, 15);
});

// Add logging hook
app.addHook('onRequest', async (request) => {
  Logger.request(request);
});

app.addHook('onResponse', async (request, reply) => {
  const responseTime = reply.getResponseTime();
  Logger.response(request, reply.statusCode, responseTime);
});

// Register routes
app.register(healthRoutes);
app.register(searchRoutes);
app.register(verifyRoutes);

// Error handler
app.setErrorHandler((error, request, reply) => {
  Logger.error('Unhandled error', error);
  
  // Don't expose internal errors in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  return reply.status(500).send({
    error: 'Internal Server Error',
    message: isProduction ? 'Something went wrong' : error.message,
    statusCode: 500,
  });
});

// 404 handler
app.setNotFoundHandler((request, reply) => {
  Logger.warn('Route not found', { 
    method: request.method, 
    url: request.url 
  });
  
  return reply.status(404).send({
    error: 'Not Found',
    message: `Route ${request.method} ${request.url} not found`,
    statusCode: 404,
  });
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  Logger.info(`Received ${signal}, starting graceful shutdown`);
  
  app.close()
    .then(() => {
      Logger.info('Server closed successfully');
      process.exit(0);
    })
    .catch((error) => {
      Logger.error('Error during server shutdown', error);
      process.exit(1);
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001', 10);
    const host = process.env.HOST || '0.0.0.0';
    
    await app.listen({ port, host });
    
    Logger.info('Server started successfully', {
      port,
      host,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    Logger.error('Failed to start server', error as Error);
    process.exit(1);
  }
};

// Start the server
start();

// Export for testing
export default app;