import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client!: Redis;

  async onModuleInit() {
    this.client = new Redis({
      host: 'localhost',
      port: 6379,
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected');
    });
  }

  async setJSON(key: string, value: unknown, ttlSeconds = 60) {
    await this.client.set(
      key,
      JSON.stringify(value),
      'EX',
      ttlSeconds,
    );
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  async del(key: string) {
    await this.client.del(key);
  }



 getClient(): Redis {
    return this.client;
  }

}