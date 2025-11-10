import pino from 'pino';

// Create logger instance
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  } : undefined,
  redact: {
    paths: [
      // Redact any potential sensitive data
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
    ],
  },
});

/**
 * Structured logging utilities
 */
export class Logger {
  static info(message: string, meta?: Record<string, any>): void {
    logger.info(meta, message);
  }

  static error(message: string, error?: Error | Record<string, any>): void {
    if (error instanceof Error) {
      logger.error({
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      }, message);
    } else {
      logger.error(error, message);
    }
  }

  static warn(message: string, meta?: Record<string, any>): void {
    logger.warn(meta, message);
  }

  static debug(message: string, meta?: Record<string, any>): void {
    logger.debug(meta, message);
  }

  /**
   * Log API request
   */
  static request(req: any): void {
    logger.info({
      method: req.method,
      url: req.url,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
      requestId: req.id,
    }, 'API Request');
  }

  /**
   * Log API response
   */
  static response(req: any, statusCode: number, responseTime: number): void {
    logger.info({
      method: req.method,
      url: req.url,
      statusCode,
      responseTime,
      requestId: req.id,
    }, 'API Response');
  }

  /**
   * Log verification attempt
   */
  static verification(inputType: string, query: string, success: boolean): void {
    logger.info({
      inputType,
      query: this.sanitizeQuery(query),
      success,
      timestamp: new Date().toISOString(),
    }, 'Medicine Verification Attempt');
  }

  /**
   * Log search query
   */
  static search(query: string, resultCount: number, responseTime: number): void {
    logger.info({
      query: this.sanitizeQuery(query),
      resultCount,
      responseTime,
      timestamp: new Date().toISOString(),
    }, 'Medicine Search');
  }

  /**
   * Sanitize sensitive query data for logging
   */
  private static sanitizeQuery(query: string): string {
    // Remove potential sensitive information while preserving useful data
    return query
      .replace(/\b\d{11}\b/g, '[MAS_NUMBER]') // Hide 11-digit MAS numbers
      .replace(/\b\d{8,13}\b/g, '[BARCODE]') // Hide barcodes
      .substring(0, 100); // Limit length
  }
}

export default logger;