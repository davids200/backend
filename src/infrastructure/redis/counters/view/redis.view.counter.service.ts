import {
  Injectable,
} from '@nestjs/common';
import { RedisService } from '../../redis.service';


@Injectable()
export class RedisViewCounterService {
  constructor(
    private readonly redis:      RedisService,
  ) {}

  // =====================================================
  // VIEW COUNTER
  // =====================================================

  async incrementViews(
    postId:string,
  ){

    await this.redis.incr(

      `post:${postId}:views`,
    );
  }

  async getViewsCount(
    postId:string,
  ){

    const count =
      await this.redis.get(

        `post:${postId}:views`,
      );

    return Number(
      count || 0,
    );
  }

  // =====================================================
  // DWELL TIME
  // =====================================================

  async addDwellTime(

    postId:string,

    dwellTimeMs:number,
  ){

    await this.redis.incrBy(

      `post:${postId}:dwellTimeMs`,

      dwellTimeMs,
    );
  }

  async getDwellTime(
    postId:string,
  ){

    const value =
      await this.redis.get(

        `post:${postId}:dwellTimeMs`,
      );

    return Number(
      value || 0,
    );
  }

  // =====================================================
  // VIEW DEDUPE
  // =====================================================

  async viewExists(
    key:string,
  ){

    return this.redis.exists(
      key,
    );
  }

  async setViewWindow(

    key:string,

    ttlSeconds:number,
  ){

    await this.redis.set(

      key,

      '1',

      'EX',

      ttlSeconds,
    );
  }
}