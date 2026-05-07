import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { RedisService }
from '../redis.service';

@Injectable()
export class RedisTrendingService {
  private readonly logger =
    new Logger(RedisTrendingService.name);

  constructor(
    private readonly redis: RedisService,
  ) {}

  // =====================================================
  // REDIS KEYS
  // =====================================================

  private readonly GLOBAL_KEY =
    'trending:global';

  private locationKey(
    locationId: string,
  ) {

    return `trending:location:${locationId}`;
  }

  // =====================================================
  // ADD / UPDATE TRENDING SCORE
  // =====================================================

  async addScore(params: {
    postId: string;
    score: number;
    locationId?: string;
  }) {

    const {
      postId,
      score,
      locationId,
    } = params;

    // ================================================
    // GLOBAL TRENDING
    // ================================================

    await this.redis.client.zincrby(
      this.GLOBAL_KEY,
      score,
      postId,
    );

    // ================================================
    // LOCATION TRENDING
    // ================================================

    if (locationId) {

      await this.redis.client.zincrby(
        this.locationKey(locationId),
        score,
        postId,
      );
    }
  }

  // =====================================================
  // GET GLOBAL TRENDING
  // =====================================================

  async getGlobal(
    limit = 20,
  ): Promise<string[]> {

    return this.redis.client.zrevrange(
      this.GLOBAL_KEY,
      0,
      limit - 1,
    );
  }

  // =====================================================
  // GET LOCATION TRENDING
  // =====================================================

  async getByLocation(
    locationId: string,
    limit = 20,
  ): Promise<string[]> {

    return this.redis.client.zrevrange(
      this.locationKey(locationId),
      0,
      limit - 1,
    );
  }

  // =====================================================
  // DECAY GLOBAL TRENDING
  // =====================================================

  async decayGlobal(
    weight = 0.9,
  ) {

    await this.redis.client.zinterstore(
      this.GLOBAL_KEY,
      1,
      this.GLOBAL_KEY,
      'WEIGHTS',
      weight,
    );

    // this.logger.log(
    //   `Global trending decayed by ${weight}`,
    // );
  }

  // =====================================================
  // DECAY LOCATION TRENDING
  // =====================================================

  async decayLocation(
    locationId: string,
    weight = 0.9,
  ) {

    const key =
      this.locationKey(locationId);

    await this.redis.client.zinterstore(
      key,
      1,
      key,
      'WEIGHTS',
      weight,
    );

    // this.logger.log(
    //   `Location trending decayed: ${locationId}`,
    // );
  }
}