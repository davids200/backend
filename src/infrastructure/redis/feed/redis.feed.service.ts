import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';

@Injectable()
export class RedisFeedService {
  constructor(private readonly redis: RedisService) {}

  async addToFeed(userId: string, postId: string, score: number) {
    await this.redis
      .getClient()
      .zadd(`feed:${userId}`, score, postId);
  }

  async getFeed(userId: string, limit = 20, offset = 0): Promise<string[]> {
    return this.redis
      .getClient()
      .zrevrange(`feed:${userId}`, offset, offset + limit - 1);
  }

  async trimFeed(userId: string, max = 500) {
    await this.redis
      .getClient()
      .zremrangebyrank(`feed:${userId}`, 0, -max - 1);
  }
}