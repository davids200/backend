import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisPubSubService {
  private pub = new Redis();
  private sub = new Redis();

  async publish(channel: string, data: any) {
    await this.pub.publish(channel, JSON.stringify(data));
  }

  async subscribe(channel: string, handler: (msg: any) => void) {
    await this.sub.subscribe(channel);

    this.sub.on('message', (_, message) => {
      handler(JSON.parse(message));
    });
  }
}