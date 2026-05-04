import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';

@Injectable()
export class RedisNotificationService {
  constructor(private readonly redis: RedisService) {}

  private key(userId: string) {
    return `notifications:${userId}`;
  }

  // =========================
  // ADD NOTIFICATION
  // =========================
  async addNotification(userId: string, notificationId: string) {
    // ZSET (latest first)
    await this.redis
      .getClient()
      .zadd(this.key(userId), Date.now(), notificationId);
  }

  // =========================
  // GET NOTIFICATIONS
  // =========================
  async getNotifications(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<string[]> {
    return this.redis
      .getClient()
      .zrevrange(this.key(userId), offset, offset + limit - 1);
  }

  // =========================
  // TRIM
  // =========================
  async trim(userId: string, max = 500) {
    await this.redis
      .getClient()
      .zremrangebyrank(this.key(userId), 0, -max - 1);
  }
}