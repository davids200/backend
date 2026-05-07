import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { RedisService }
from '../redis.service';

@Injectable()
export class RedisCounterService {
  private readonly logger =
    new Logger(RedisCounterService.name);

  constructor(
    private readonly redis: RedisService,
  ) {}

  // =====================================================
  // REDIS KEYS
  // =====================================================

  private likeKey(
    type: string,
    id: string,
  ) {

    return `likes:${type}:${id}`;
  }

  private commentKey(
    postId: string,
  ) {

    return `comments:post:${postId}`;
  }

  // =====================================================
  // INCREMENT LIKES
  // =====================================================

  async incrementLikes(
    type: string,
    id: string,
  ) {

    await this.redis.client.incr(
      this.likeKey(type, id),
    );
  }

  // =====================================================
  // DECREMENT LIKES
  // =====================================================

  async decrementLikes(
    type: string,
    id: string,
  ) {

    await this.redis.client.decr(
      this.likeKey(type, id),
    );
  }

  // =====================================================
  // INCREMENT COMMENTS
  // =====================================================

  async incrementComments(
    postId: string,
  ) {

    await this.redis.client.incr(
      this.commentKey(postId),
    );
  }

  // =====================================================
  // DECREMENT COMMENTS
  // =====================================================

  async decrementComments(
    postId: string,
  ) {

    await this.redis.client.decr(
      this.commentKey(postId),
    );
  }

  // =====================================================
  // GET LIKE COUNT
  // =====================================================

  async getLikes(
    type: string,
    id: string,
  ): Promise<number> {

    const value =
      await this.redis.client.get(
        this.likeKey(type, id),
      );

    return value
      ? parseInt(value, 10)
      : 0;
  }

  // =====================================================
  // GET COMMENT COUNT
  // =====================================================

  async getComments(
    postId: string,
  ): Promise<number> {

    const value =
      await this.redis.client.get(
        this.commentKey(postId),
      );

    return value
      ? parseInt(value, 10)
      : 0;
  }

  // =====================================================
  // BULK COUNTS
  // =====================================================

  async getBulkCounts(
    postIds: string[],
  ): Promise<
    Record<
      string,
      {
        likes: number;
        comments: number;
      }
    >
  > {

    // ================================================
    // EMPTY INPUT
    // ================================================

    if (!postIds.length) {
      return {};
    }

    // ================================================
    // REDIS PIPELINE
    // ================================================

    const pipeline =
      this.redis.client.pipeline();

    for (const postId of postIds) {

      pipeline.get(
        this.likeKey(
          'post',
          postId,
        ),
      );

      pipeline.get(
        this.commentKey(postId),
      );
    }

    const results =
      await pipeline.exec();

    // ================================================
    // BUILD RESPONSE MAP
    // ================================================

    const counts: Record<
      string,
      {
        likes: number;
        comments: number;
      }
    > = {};

    postIds.forEach(
      (postId, index) => {

        const likeValue =
          results?.[
            index * 2
          ]?.[1];

        const commentValue =
          results?.[
            index * 2 + 1
          ]?.[1];

        counts[postId] = {
          likes: likeValue
            ? parseInt(
                likeValue as string,
                10,
              )
            : 0,

          comments: commentValue
            ? parseInt(
                commentValue as string,
                10,
              )
            : 0,
        };
      },
    );

    return counts;
  }



// =====================================================
// FOLLOWERS
// =====================================================

private followersKey(userId: string,) {
  return `followers:${userId}`;
}

private followingKey(userId: string,) {
  return `following:${userId}`;
}

async incrementFollowers(  userId: string,) {
  await this.redis.client.incr(this.followersKey(userId),);
}

async decrementFollowers(userId: string,) {
  await this.redis.client.decr(this.followersKey(userId),);
}

async incrementFollowing(userId: string,) {
  await this.redis.client.incr(this.followingKey(userId),);
}

async decrementFollowing(userId: string,) {
  await this.redis.client.decr(this.followingKey(userId),);
}


}