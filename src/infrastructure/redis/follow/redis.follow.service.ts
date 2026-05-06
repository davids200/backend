import { Injectable } from '@nestjs/common';

import { RedisService }
from '../redis.service';

@Injectable()
export class RedisFollowService {
  constructor(
    private readonly redis: RedisService,
  ) {}

  // =====================================================
  // FOLLOW USER
  // =====================================================

  async followUser(
    followerId: string,
    followingId: string,
  ) {

    // user follows someone
    await this.redis.client.sadd(
      `following:${followerId}`,
      followingId,
    );

    // target gains follower
    await this.redis.client.sadd(
      `followers:${followingId}`,
      followerId,
    );
  }

  // =====================================================
  // UNFOLLOW USER
  // =====================================================

  async unfollowUser(
    followerId: string,
    followingId: string,
  ) {

    await this.redis.client.srem(
      `following:${followerId}`,
      followingId,
    );

    await this.redis.client.srem(
      `followers:${followingId}`,
      followerId,
    );
  }

  // =====================================================
  // GET FOLLOWERS
  // =====================================================

  async getFollowers(
    userId: string,
  ): Promise<string[]> {

    return this.redis.client.smembers(
      `followers:${userId}`,
    );
  }

  // =====================================================
  // GET FOLLOWING
  // =====================================================

  async getFollowing(
    userId: string,
  ): Promise<string[]> {

    return this.redis.client.smembers(
      `following:${userId}`,
    );
  }

  // =====================================================
  // CHECK IF FOLLOWING
  // =====================================================

  async isFollowing(
    followerId: string,
    followingId: string,
  ): Promise<boolean> {

    const result =
      await this.redis.client.sismember(
        `following:${followerId}`,
        followingId,
      );

    return result === 1;
  }

  // =====================================================
  // FOLLOWER COUNT
  // =====================================================

  async getFollowersCount(
    userId: string,
  ): Promise<number> {

    return this.redis.client.scard(
      `followers:${userId}`,
    );
  }

  // =====================================================
  // FOLLOWING COUNT
  // =====================================================

  async getFollowingCount(
    userId: string,
  ): Promise<number> {

    return this.redis.client.scard(
      `following:${userId}`,
    );
  }
}