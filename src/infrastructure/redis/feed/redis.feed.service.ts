import { Injectable } from '@nestjs/common';

import { RedisService }
from '../redis.service';

@Injectable()
export class RedisFeedService {
  constructor(
    private readonly redis: RedisService,
  ) {}

  // =====================================================
  // ADD TO USER FEED
  // =====================================================

  async addToFeed(
    userId: string,
    postId: string,
    score: number,
  ) {

    return this.redis.client.zadd(
      `feed:${userId}`,
      score.toString(),
      postId,
    );
  }

  // =====================================================
  // REMOVE POST FROM FEED
  // =====================================================

  async removePost(
    userId: string,
    postId: string,
  ) {

    return this.redis.client.zrem(
      `feed:${userId}`,
      postId,
    );
  }

  // =====================================================
  // SIMPLE FEED
  // =====================================================

  async getFeed(
    userId: string,
    start = 0,
    stop = 20,
  ): Promise<string[]> {

    return this.redis.client.zrevrange(
      `feed:${userId}`,
      start,
      stop,
    );
  }

  // =====================================================
  // CURSOR PAGINATED FEED
  // =====================================================

  async getFeedWithCursor(
    userId: string,
    limit = 20,
    cursor?: number,
  ): Promise<string[]> {

    const start = cursor || 0;

    const stop = start + limit - 1;

    return this.redis.client.zrevrange(
      `feed:${userId}`,
      start,
      stop,
    );
  }

  // =====================================================
  // GLOBAL TRENDING
  // =====================================================

  async getGlobalTrending(
    limit = 20,
  ): Promise<string[]> {

    return this.redis.client.zrevrange(
      'trending:global',
      0,
      limit - 1,
    );
  }

  // =====================================================
  // LOCATION TRENDING
  // =====================================================

  async getLocationTrending(
    locationId: string,
    limit = 20,
  ): Promise<string[]> {

    return this.redis.client.zrevrange(
      `trending:location:${locationId}`,
      0,
      limit - 1,
    );
  }

  // =====================================================
  // ADD GLOBAL TRENDING
  // =====================================================

  async addGlobalTrending(
    postId: string,
    score: number,
  ) {

    return this.redis.client.zadd(
      'trending:global',
      score.toString(),
      postId,
    );
  }

  // =====================================================
  // ADD LOCATION TRENDING
  // =====================================================

  async addLocationTrending(
    locationId: string,
    postId: string,
    score: number,
  ) {

    return this.redis.client.zadd(
      `trending:location:${locationId}`,
      score.toString(),
      postId,
    );
  }



async trimFeed(
  userId: string,
  max = 500,
) {

  await this.redis.client.zremrangebyrank(
    `feed:${userId}`,
    0,
    -max - 1,
  );
}




}