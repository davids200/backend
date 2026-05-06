import { Injectable } from '@nestjs/common';
import { RedisTrendingService } from '../../../infrastructure/redis/trending/redis.trending.service';

@Injectable()
export class TrendingService {
  constructor(private readonly redisTrending: RedisTrendingService) {}

  async getTrending(userLocationId?: string) {
    const global = await this.redisTrending.getGlobal(10);

    let local: string[] = [];

    if (userLocationId) {
      local = await this.redisTrending.getByLocation(
        userLocationId,
        10,
      );
    }

    return {
      global,
      local,
    };
  }
}