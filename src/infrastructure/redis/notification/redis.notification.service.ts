import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { RedisService }
from '../redis.service';

@Injectable()
export class RedisNotificationService {
  private readonly logger =
    new Logger(
      RedisNotificationService.name,
    );

  constructor(
    private readonly redis: RedisService,
  ) {}

  // =====================================================
  // REDIS KEY
  // =====================================================

  private notificationKey(
    userId: string,
  ) {

    return `notifications:${userId}`;
  }

  // =====================================================
  // ADD NOTIFICATION
  // =====================================================

  async addNotification(params: {
    userId: string;
    notificationId: string;
    timestamp?: number;
  }) {

    const {
      userId,
      notificationId,
      timestamp,
    } = params;

    // ================================================
    // SAFE TIMESTAMP
    // ================================================

    const now = Date.now();

    const safeTimestamp =
      timestamp &&
      timestamp > 0
        ? Math.min(timestamp, now)
        : now;

    await this.redis.client.zadd(
      this.notificationKey(userId),

      safeTimestamp.toString(),

      notificationId,
    );
  }

  // =====================================================
  // GET NOTIFICATIONS
  // =====================================================

  async getNotifications(params: {
    userId: string;
    limit?: number;
    offset?: number;
  }): Promise<string[]> {

    const {
      userId,
      limit = 20,
      offset = 0,
    } = params;

    return this.redis.client.zrevrange(
      this.notificationKey(userId),

      offset,

      offset + limit - 1,
    );
  }

  // =====================================================
  // REMOVE NOTIFICATION
  // =====================================================

  async removeNotification(params: {
    userId: string;
    notificationId: string;
  }) {

    const {
      userId,
      notificationId,
    } = params;

    await this.redis.client.zrem(
      this.notificationKey(userId),
      notificationId,
    );
  }

  // =====================================================
  // CLEAR ALL NOTIFICATIONS
  // =====================================================

  async clearNotifications(
    userId: string,
  ) {

    await this.redis.client.del(
      this.notificationKey(userId),
    );
  }

  // =====================================================
  // TRIM OLD NOTIFICATIONS
  // =====================================================

  async trim(
    userId: string,
    max = 500,
  ) {

    const key =
      this.notificationKey(userId);

    const total =
      await this.redis.client.zcard(
        key,
      );

    // ================================================
    // NOTHING TO TRIM
    // ================================================

    if (total <= max) {
      return;
    }

    const removeCount =
      total - max;

    // ================================================
    // REMOVE OLDEST
    // ================================================

    await this.redis.client
      .zremrangebyrank(
        key,
        0,
        removeCount - 1,
      );

    // this.logger.log(
    //   `Trimmed ${removeCount} notifications for ${userId}`,
    // );
  }
}