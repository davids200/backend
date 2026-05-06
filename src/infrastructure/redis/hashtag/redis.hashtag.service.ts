import { Injectable } from '@nestjs/common';

import { RedisService }
from '../redis.service';

@Injectable()
export class RedisHashtagService {
  constructor(
    private readonly redis: RedisService,
  ) {}

  // =====================================================
  // INCREMENT HASHTAG SCORE
  // =====================================================

  async incrementHashtagScore(
    hashtag: string,
    score: number,
  ) {

    return this.redis.client.zincrby(
      'trending:hashtags',
      score,
      hashtag,
    );
  }

  // =====================================================
  // GET TOP TRENDING HASHTAGS
  // =====================================================

  async getTrendingHashtags(
    limit = 20,
  ): Promise<string[]> {

    return this.redis.client.zrevrange(
      'trending:hashtags',
      0,
      limit - 1,
    );
  }

  // =====================================================
  // LOCATION TRENDING
  // =====================================================

  async incrementLocationHashtagScore(
    locationId: string,
    hashtag: string,
    score: number,
  ) {

    return this.redis.client.zincrby(
      `trending:hashtags:${locationId}`,
      score,
      hashtag,
    );
  }
}