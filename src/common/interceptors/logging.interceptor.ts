import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('performance');
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const method = request.method;
    const url = request.url;
    const startTime= Date.now();
   this.logger.log(`Before Handling Routes:[ ${method}] ${url}`);
    return next
      .handle()
      .pipe(tap(() => {
    const duration = Date.now() - startTime;
    this.logger.log(`After Handling Routes:[ ${method}] ${url} Took: ${duration}ms`);
      }
    ));
  }
}
