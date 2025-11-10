import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { GreenbookService } from '@/services/greenbook';
import { Logger } from '@/utils/logger';
import { HealthResponse } from '@/types';

/**
 * Health check route
 */
export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', {
    schema: {
      description: 'Health check endpoint',
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            version: { type: 'string' },
            services: {
              type: 'object',
              properties: {
                greenbook: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    responseTime: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();
    
    try {
      // Check external services
      const greenbookHealth = await GreenbookService.healthCheck();
      
      const response: HealthResponse = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
      };

      // Add service health to response
      (response as any).services = {
        greenbook: greenbookHealth,
      };

      const responseTime = Date.now() - startTime;
      Logger.response(request, 200, responseTime);
      
      return reply.status(200).send(response);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      Logger.error('Health check failed', error as Error);
      Logger.response(request, 500, responseTime);
      
      return reply.status(500).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
      });
    }
  });

  // Simple ping endpoint
  fastify.get('/ping', {
    schema: {
      description: 'Simple ping endpoint',
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: {
            pong: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const responseTime = Date.now() - Date.now();
    Logger.response(request, 200, responseTime);
    
    return reply.status(200).send({
      pong: 'pong',
      timestamp: new Date().toISOString(),
    });
  });
}