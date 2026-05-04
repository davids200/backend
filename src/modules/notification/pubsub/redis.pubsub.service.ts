import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../infrastructure/redis/redis.service';

@Injectable()
export class RedisPubSubService {
  constructor(private readonly redis: RedisService) {}

  async publish(channel: string, data: any) {
    await this.redis
      .getClient()
      .publish(channel, JSON.stringify(data));
  }

  async subscribe(channel: string, callback: (msg: any) => void) {
    const sub = this.redis.getClient().duplicate();

    await sub.subscribe(channel);

    sub.on('message', (ch, message) => {
      if (ch === channel) {
        callback(JSON.parse(message));
      }
    });
  }
}