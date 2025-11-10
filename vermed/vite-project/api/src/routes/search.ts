

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SearchRequestSchema } from '@/types';
import { GreenbookService } from '@/services/greenbook';
import { Logger } from '@/utils/logger';
import { SearchResult } from '@/types';

/**
 * Search routes for medicine lookup
 */
export async function searchRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/search', {
    schema: {
      description: 'Search for medicines',
      tags: ['search'],
      querystring: SearchRequestSchema,
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              regNo: { type: 'string' },
              manufacturer: { type: 'string' },
              category: { type: 'string' },
            },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();
    
    try {
      const { q } = request.query as { q: string };
      
      Logger.request(request);
      Logger.search(q, 0, 0); // Initial log

      // Validate query
      if (!q || q.trim().length === 0) {
        const responseTime = Date.now() - startTime;
        Logger.response(request, 400, responseTime);
        
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Search query is required',
        });
      }

      if (q.length > 100) {
        const responseTime = Date.now() - startTime;
        Logger.response(request, 400, responseTime);
        
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Search query too long (max 100 characters)',
        });
      }

      // Perform search
      const results = await GreenbookService.search(q);
      
      // Transform to SearchResult format
      const searchResults: SearchResult[] = results.map((product, index) => ({
        id: `search_${Date.now()}_${index}`,
        title: product.title,
        regNo: product.regNo,
        manufacturer: product.manufacturer,
        category: product.category,
      }));

      const responseTime = Date.now() - startTime;
      Logger.search(q, searchResults.length, responseTime);
      Logger.response(request, 200, responseTime);

      return reply.status(200).send(searchResults);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      Logger.error('Search request failed', error as Error);
      Logger.response(request, 500, responseTime);

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to search medicines',
      });
    }
  });

  // Search suggestions endpoint (optional enhancement)
  fastify.get('/search/suggestions', {
    schema: {
      description: 'Get search suggestions',
      tags: ['search'],
      querystring: SearchRequestSchema,
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              type: { type: 'string' },
            },
          },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();
    
    try {
      const { q } = request.query as { q: string };
      
      Logger.request(request);

      if (!q || q.length < 2) {
        const responseTime = Date.now() - startTime;
        Logger.response(request, 200, responseTime);
        return reply.status(200).send([]);
      }

      // For MVP, return basic suggestions
      const suggestions = [
        { text: 'Paracetamol', type: 'medicine' },
        { text: 'Amoxicillin', type: 'medicine' },
        { text: 'Ibuprofen', type: 'medicine' },
        { text: 'Vitamin C', type: 'supplement' },
      ].filter(suggestion => 
        suggestion.text.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 5);

      const responseTime = Date.now() - startTime;
      Logger.response(request, 200, responseTime);

      return reply.status(200).send(suggestions);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      Logger.error('Suggestions request failed', error as Error);
      Logger.response(request, 500, responseTime);

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get suggestions',
      });
    }
  });
}