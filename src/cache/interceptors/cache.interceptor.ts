import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { RedisService } from '../cache.service';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(private readonly redisService: RedisService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    if (request.method !== 'GET') return next.handle();

    const cacheKey = `Cache:${request.originalUrl || request.url}`;
    try {
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        return of(JSON.parse(cachedData));
      }
    } catch (error) {
      console.log('Redis Read Failer Safely Skipped', error);
    }

    return next.handle().pipe(
      map(async (data) => {
        try {
          if (data) {
            await this.redisService.set(cacheKey, JSON.stringify(data), 300);
          }
        } catch (error) {
          console.error('Redis Write Failer Safely Skipped', error);
        }
        return data;
      }),
    );
  }
}
