import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';

@Injectable()
export class RedisFollowService {
  constructor(private readonly redis: RedisService) {}

  private followersKey(userId: string) {
    return `followers:${userId}`;
  }

  private followingKey(userId: string) {
    return `following:${userId}`;
  }

  // =========================
  // FOLLOW
  // =========================
  async follow(followerId: string, followingId: string) {
    const client = this.redis.getClient();

    await Promise.all([
      client.sadd(this.followingKey(followerId), followingId),
      client.sadd(this.followersKey(followingId), followerId),
    ]);
  }

  // =========================
  // UNFOLLOW
  // =========================
  async unfollow(followerId: string, followingId: string) {
    const client = this.redis.getClient();

    await Promise.all([
      client.srem(this.followingKey(followerId), followingId),
      client.srem(this.followersKey(followingId), followerId),
    ]);
  }

  // =========================
  // GET FOLLOWERS
  // =========================
  async getFollowers(userId: string): Promise<string[]> {
    return this.redis.getClient().smembers(this.followersKey(userId));
  }

  // =========================
  // GET FOLLOWING
  // =========================
  async getFollowing(userId: string): Promise<string[]> {
    return this.redis.getClient().smembers(this.followingKey(userId));
  }

  // =========================
  // CHECK RELATION
  // =========================
  async isFollowing(
    followerId: string,
    followingId: string,
  ): Promise<boolean> {
    const result = await this.redis
      .getClient()
      .sismember(this.followingKey(followerId), followingId);

    return result === 1;
  }
}