import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';
import { MAXIMUM_REDIS_FEED } from '../../../modules/feed/feed.constants';

@Injectable()
export class RedisFeedService {
constructor(private readonly redis: RedisService) {}

private client() {
return this.redis.getClient();
}

// =========================
// ZSET FEED (PRECOMPUTED)
// =========================
private feedKey(userId: string) {
return `feed:${userId}`;
}

async addToFeed(userId: string, postId: string, score: number) {
await this.client().zadd(this.feedKey(userId), score, postId); //ZSET = Sorted Set,It stores:(score, value)
}

async getFeed(userId: string, limit = 20, offset = 0) {
return this.client().zrevrange( //Get items sorted from highest → lowest score
this.feedKey(userId),
offset,
offset + limit - 1,
);
}


  //This removes old posts//If user has:1000 posts,After trim:only latest 500 remain
  async trimFeed(userId: string, maxSize = MAXIMUM_REDIS_FEED) {
    await this.client().zremrangebyrank(
      this.feedKey(userId),
      0,
      -maxSize - 1,
    );
  }

  // =========================
  // JSON CACHE (GRAPHQL)
  // =========================
  private cacheKey(key: string) {
    return `feed_cache:${key}`;
  }

  async getCachedFeed<T = any>(key: string): Promise<T | null> {
    const data = await this.client().get(this.cacheKey(key));
    return data ? JSON.parse(data) : null;
  }

  async setCachedFeed(key: string, value: any, ttl = 60) {
    await this.client().set(
      this.cacheKey(key),
      JSON.stringify(value),
      'EX',
      ttl,
    );
  }

  async invalidateCache(key: string) {
    await this.client().del(this.cacheKey(key));
  }
}