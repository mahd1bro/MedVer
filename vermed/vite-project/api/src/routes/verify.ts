

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { VerifyRequestSchema } from '@/types';
import { GreenbookService } from '@/services/greenbook';
import { Logger } from '@/utils/logger';
import { 
  normalizeQuery, 
  extractNafdacRegNo, 
  generateLookupId, 
  determineInputType,
  sanitizeInput 
} from '@/utils/normalize';
import { VerifyRequest, VerifyResponse, ProductLookup } from '@/types';

/**
 * Verification routes for medicine authentication
 */
export async function verifyRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post('/verify', {
    schema: {
      description: 'Verify medicine authenticity',
      tags: ['verify'],
      body: VerifyRequestSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            product: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                inputType: { type: 'string' },
                inputValue: { type: 'string' },
                normalizedQuery: { type: 'string' },
                greenbook: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    title: { type: 'string' },
                    regNo: { type: 'string' },
                    link: { type: 'string' },
                    lastChecked: { type: 'string' },
                  },
                },
                alerts: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      description: { type: 'string' },
                      link: { type: 'string' },
                    },
                  },
                },
                createdAt: { type: 'string' },
              },
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
      const body = request.body as VerifyRequest;
      
      Logger.request(request);

      // Validate request body
      if (!body.barcode && !body.regNo && !body.name) {
        const responseTime = Date.now() - startTime;
        Logger.response(request, 400, responseTime);
        
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'At least one of barcode, regNo, or name must be provided',
        });
      }

      // Sanitize inputs
      const sanitizedBody = {
        barcode: body.barcode ? sanitizeInput(body.barcode) : undefined,
        regNo: body.regNo ? sanitizeInput(body.regNo) : undefined,
        name: body.name ? sanitizeInput(body.name) : undefined,
      };

      // Determine input type and value
      let inputValue = '';
      let inputType: 'barcode' | 'manual' | 'ocr';
      let normalizedQuery = '';

      if (sanitizedBody.barcode) {
        inputValue = sanitizedBody.barcode;
        inputType = 'barcode';
        normalizedQuery = normalizeQuery(sanitizedBody.barcode);
      } else if (sanitizedBody.regNo) {
        inputValue = sanitizedBody.regNo;
        inputType = 'manual';
        normalizedQuery = extractNafdacRegNo(sanitizedBody.regNo) || normalizeQuery(sanitizedBody.regNo);
      } else if (sanitizedBody.name) {
        inputValue = sanitizedBody.name;
        inputType = 'manual';
        normalizedQuery = normalizeQuery(sanitizedBody.name);
      } else {
        inputType = 'manual';
        inputValue = '';
        normalizedQuery = '';
      }

      // Generate unique lookup ID
      const lookupId = generateLookupId(inputValue, inputType);

      // Perform verification
      let greenbookResult;
      let verificationStatus: 'registered' | 'not_found' | 'error';

      try {
        if (sanitizedBody.regNo || extractNafdacRegNo(inputValue)) {
          const regNo = sanitizedBody.regNo || extractNafdacRegNo(inputValue);
          if (regNo) {
            greenbookResult = await GreenbookService.verifyByRegNo(regNo);
          }
        } else if (sanitizedBody.name || normalizedQuery) {
          const name = sanitizedBody.name || normalizedQuery;
          greenbookResult = await GreenbookService.verifyByName(name);
        } else if (sanitizedBody.barcode) {
          // For barcodes, try to search as name first
          greenbookResult = await GreenbookService.verifyByName(sanitizedBody.barcode);
        }

        if (greenbookResult) {
          verificationStatus = 'registered';
        } else {
          verificationStatus = 'not_found';
          greenbookResult = {
            title: inputValue || 'Unknown Medicine',
            status: 'not_found',
            link: GreenbookService.buildSearchLink(inputValue),
          };
        }
      } catch (error) {
        Logger.error('Verification failed', error as Error);
        verificationStatus = 'error';
        greenbookResult = {
          title: inputValue || 'Unknown Medicine',
          status: 'error',
          link: GreenbookService.buildSearchLink(inputValue),
        };
      }

      // Create product lookup object
      const product: ProductLookup = {
        id: lookupId,
        inputType,
        inputValue,
        normalizedQuery,
        greenbook: {
          status: verificationStatus,
          title: greenbookResult.title,
          regNo: greenbookResult.regNo,
          link: greenbookResult.link,
          lastChecked: new Date().toISOString(),
        },
        alerts: generateAlerts(verificationStatus, greenbookResult),
        createdAt: new Date().toISOString(),
      };

      // Log verification attempt
      Logger.verification(inputType, normalizedQuery, verificationStatus === 'registered');

      const response: VerifyResponse = { product };

      const responseTime = Date.now() - startTime;
      Logger.response(request, 200, responseTime);

      return reply.status(200).send(response);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      Logger.error('Verify request failed', error as Error);
      Logger.response(request, 500, responseTime);

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to verify medicine',
      });
    }
  });

  // Batch verification endpoint (future enhancement)
  fastify.post('/verify/batch', {
    schema: {
      description: 'Verify multiple medicines',
      tags: ['verify'],
      body: {
        type: 'object',
        properties: {
          requests: {
            type: 'array',
            items: VerifyRequestSchema,
            maxItems: 10, // Limit batch size
          },
        },
        required: ['requests'],
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();
    
    try {
      const { requests } = request.body as { requests: VerifyRequest[] };
      
      Logger.request(request);

      if (!requests || requests.length === 0) {
        const responseTime = Date.now() - startTime;
        Logger.response(request, 400, responseTime);
        
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'At least one verification request is required',
        });
      }

      if (requests.length > 10) {
        const responseTime = Date.now() - startTime;
        Logger.response(request, 400, responseTime);
        
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Maximum 10 verification requests allowed per batch',
        });
      }

      // Process each verification (simplified for MVP)
      const results = [];
      for (const verifyRequest of requests) {
        try {
          // For now, just return a placeholder response
          const mockProduct: ProductLookup = {
            id: generateLookupId(verifyRequest.barcode || verifyRequest.regNo || verifyRequest.name || '', 'manual'),
            inputType: determineInputType(verifyRequest.barcode || verifyRequest.regNo || verifyRequest.name || ''),
            inputValue: verifyRequest.barcode || verifyRequest.regNo || verifyRequest.name || '',
            normalizedQuery: normalizeQuery(verifyRequest.barcode || verifyRequest.regNo || verifyRequest.name || ''),
            greenbook: {
              status: 'not_found',
              title: verifyRequest.barcode || verifyRequest.regNo || verifyRequest.name || 'Unknown',
              link: GreenbookService.buildSearchLink(verifyRequest.barcode || verifyRequest.regNo || verifyRequest.name || ''),
              lastChecked: new Date().toISOString(),
            },
            createdAt: new Date().toISOString(),
          };

          results.push({ product: mockProduct });
        } catch (error) {
          Logger.error('Batch verification item failed', error as Error);
          // Continue processing other items
        }
      }

      const responseTime = Date.now() - startTime;
      Logger.response(request, 200, responseTime);

      return reply.status(200).send({ results });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      Logger.error('Batch verification failed', error as Error);
      Logger.response(request, 500, responseTime);

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to verify medicines',
      });
    }
  });
}

/**
 * Generate alerts based on verification status
 */
function generateAlerts(
  status: 'registered' | 'not_found' | 'error',
  result: any
): Array<{ title: string; description: string; link?: string }> {
  const alerts = [];

  if (status === 'registered') {
    alerts.push({
      title: 'Medicine is Registered',
      description: 'This medicine is registered with NAFDAC. Always purchase from licensed pharmacies.',
    });
  } else if (status === 'not_found') {
    alerts.push({
      title: 'Medicine Not Found',
      description: 'This medicine was not found in NAFDAC database. Exercise extreme caution.',
      link: 'https://www.nafdac.gov.ng/report-suspicious-products/',
    });
  } else if (status === 'error') {
    alerts.push({
      title: 'Verification Error',
      description: 'Unable to complete verification. Please try again or contact NAFDAC directly.',
    });
  }

  return alerts;
}