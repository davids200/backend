import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';
 
 

@Injectable()
export class RedisFeedService {
  constructor(
    private readonly redis: RedisService,
  ) {}
 

  // =====================================================
  // GLOBAL TRENDING
  // =====================================================

  async getGlobalTrending(limit = 20,): Promise<string[]> {
    return this.redis.client.zrevrange('trending:global',0,limit - 1,);
  }

  // =====================================================
  // LOCATION TRENDING
  // =====================================================

  async getLocationTrending(locationId: string,limit = 20,): Promise<string[]> {
    return this.redis.client.zrevrange(`trending:location:${locationId}`,0,limit - 1,);
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



// async trimFeed(
//   userId: string,
//   max = 500,
// ) {

//   await this.redis.client.zremrangebyrank(
//     `feed:${userId}`,
//     0,
//     -max - 1,
//   );
// }




}