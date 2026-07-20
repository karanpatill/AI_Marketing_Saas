import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { BaseError } from '../utils/errors';
import { logger } from '../utils/logger';

type HandlerFunction = (req: NextRequest, context: any) => Promise<NextResponse> | NextResponse;

export function withApiWrapper(handler: HandlerFunction): HandlerFunction {
  return async (req: NextRequest, context: any) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    // Log incoming request
    logger.info({
      req: {
        id: requestId,
        method: req.method,
        url: req.nextUrl.pathname,
      }
    }, 'Incoming Request');

    try {
      const response = await handler(req, context);
      
      const duration = Date.now() - startTime;
      logger.info({
        req: { id: requestId },
        res: { status: response.status },
        duration
      }, 'Request Completed');

      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      logger.error({
        req: { id: requestId },
        err: error,
        duration
      }, 'Request Failed');

      if (error instanceof BaseError) {
        return NextResponse.json({
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          }
        }, { status: error.statusCode });
      }

      if (error instanceof ZodError) {
        return NextResponse.json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.flatten().fieldErrors
          }
        }, { status: 400 });
      }

      // Fallback for unexpected errors
      return NextResponse.json({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        }
      }, { status: 500 });
    }
  };
}
