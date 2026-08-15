import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Controllers may return an already-shaped envelope ({ success, message, data }).
        if (data && typeof data === 'object' && 'success' in (data as Record<string, unknown>)) {
          return {
            ...(data as Record<string, unknown>),
            timestamp: new Date().toISOString(),
          } as unknown as ApiResponse<T>;
        }
        return {
          success: true,
          message: 'Request successful.',
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
