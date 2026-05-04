import { Injectable } from '@nestjs/common';

import { PostService } from '../post/post.service';
import { RedisFeedService } from '../../infrastructure/redis/feed/redis.feed.service';
import { RedisCounterService } from '../../infrastructure/redis/counters/redis.counter.service';

import { calculateScore } from './utils/feed-ranking.util';

@Injectable()
export class FeedService {
  constructor(
    private readonly postService: PostService,
    private readonly redisFeed: RedisFeedService,
    private readonly redisCounter: RedisCounterService,
  ) {}

  async getFeed(userId: string, limit = 20, offset = 0) {
    // =========================
    // 1. REDIS (FAST)
    // =========================
    const postIds = await this.redisFeed.getFeed(
      userId,
      limit,
      offset,
    );

    if (!postIds.length) {
      return { data: [], nextCursor: null };
    }

    // =========================
    // 2. POSTGRES
    // =========================
    const posts = await this.postService.getPostsByIds(postIds);
    const postMap = new Map(posts.map((p) => [p.id, p]));

    // =========================
    // 3. REDIS COUNTERS
    // =========================
    const counters =
      await this.redisCounter.getBulkCounts(postIds);

    // =========================
    // 4. MERGE (SAFE)
    // =========================
    const feed = postIds
      .map((postId) => {
        const post = postMap.get(postId);
        if (!post) return null;

        const counter = counters[postId] || {
          likes: 0,
          comments: 0,
        };

        return {
          postId,
          authorId: post.authorId,
          createdAt: post.createdAt, // ✅ guaranteed
          content: post.content,
          media: post.media,
          locationId: post.locationId,
          likes: counter.likes,
          comments: counter.comments,
          isFollowingAuthor: true,
        };
      })
      .filter((p): p is NonNullable<typeof p> => !!p);

    // =========================
    // 5. RANKING
    // =========================
    const ranked = feed.sort(
      (a, b) => calculateScore(b) - calculateScore(a),
    );

    // =========================
    // 6. PAGINATION
    // =========================
    const nextCursor =
      ranked.length === limit ? offset + limit : null;

    return {
      data: ranked,
      nextCursor,
    };
  }
}