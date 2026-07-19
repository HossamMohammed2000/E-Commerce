import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: Redis;

  async onModuleInit() {
    const redisUri = process.env.REDIS_URI;
    if (!redisUri) {
      throw new Error('REDIS_URI is not defined');
    }

    this.client = new Redis(redisUri);

    this.client.on('connect', () => {
      console.log('Redis Cache Engine Connected');
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
  }

  async get(key: string) {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttlInSeconds: 300) {
    return await this.client.set(key, value, 'EX', ttlInSeconds);
  }

  async del(key: string) {
    return await this.client.del(key);
  }

  async delByPattern(pattern: string) {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) return await this.client.del(...keys);
  }
  async onModuleDestroy() {
    await this.client.quit();
  }
}
