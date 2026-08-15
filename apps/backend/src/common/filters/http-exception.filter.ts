import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorField {
  field: string;
  message: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'An unexpected error occurred. Please contact the IT Administrator.';
    let errors: ErrorField[] | undefined;

    // Prisma errors are not HttpExceptions — map known ones to sane HTTP
    // statuses instead of letting them fall through as a generic 500.
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          const target = (exception.meta?.target as string[] | undefined)?.join(', ') || 'field';
          statusCode = HttpStatus.CONFLICT;
          message = `A record with this ${target} already exists.`;
          break;
        }
        case 'P2025':
          statusCode = HttpStatus.NOT_FOUND;
          message = 'The requested record was not found.';
          break;
        case 'P2003':
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'This operation references a record that does not exist.';
          break;
        default:
          statusCode = HttpStatus.BAD_REQUEST;
          message = 'The request could not be processed due to a data conflict.';
      }
      this.logger.error(
        `Prisma error ${exception.code}: ${request.method} ${request.url} - ${exception.message}`,
      );
      response.status(statusCode).json({
        success: false,
        statusCode,
        message,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const payload = body as Record<string, unknown>;
        // Structured validation errors produced by the ValidationPipe exceptionFactory.
        if (Array.isArray(payload.errors)) {
          errors = (payload.errors as ErrorField[]).map((e) => ({
            field: e.field,
            message: e.message,
          }));
          message = typeof payload.message === 'string' ? payload.message : 'Validation failed.';
        } else if (Array.isArray(payload.message)) {
          message = 'Validation failed.';
          errors = (payload.message as string[]).map((m) => ({
            field: extractField(m),
            message: m,
          }));
        } else if (typeof payload.message === 'string') {
          message = payload.message;
        }
      }
    } else {
      this.logger.error(
        `Unhandled exception: ${exception instanceof Error ? exception.stack : String(exception)}`,
      );
    }

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} - ${exception instanceof Error ? exception.stack : String(exception)}`,
      );
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      ...(errors ? { errors } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

function extractField(message: string): string {
  const [firstWord] = message.split(' ');
  return firstWord ? firstWord.charAt(0).toLowerCase() + firstWord.slice(1) : 'unknown';
}
