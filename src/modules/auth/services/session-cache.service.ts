import {
  Injectable,
} from '@nestjs/common';

import { RedisService }
from '../../../infrastructure/redis/redis.service';

@Injectable()

export class SessionCacheService {

  constructor(

    private readonly redis:
      RedisService,
  ) {}

  // ============================================
  // CACHE SESSION
  // ============================================

  async cacheSession(
    sessionId: string,
    userId: string,
  ) {

    await this.redis.client.set(

      `session:${sessionId}`,

      userId,

      'EX',

      60 * 60 * 24 * 30,
    );
  }

  // ============================================
  // DELETE SESSION
  // ============================================

  async removeSession(
    sessionId: string,
  ) {

    await this.redis.client.del(
      `session:${sessionId}`,
    );
  }

  // ============================================
  // CHECK SESSION
  // ============================================

  async hasSession(
    sessionId: string,
  ) {

    return this.redis.client.exists(
      `session:${sessionId}`,
    );
  }
}