import { Injectable } from '@nestjs/common';

import { RedisFeedService } from '../../infrastructure/redis/feed/redis.feed.service';
import { PostService } from '../post/post.service';
import { RedisCounterService } from '../../infrastructure/redis/counters/redis.counter.service';

@Injectable()
export class FeedService {
  constructor(
    private readonly redisFeed: RedisFeedService,
    private readonly postService: PostService,
    private readonly redisCounter: RedisCounterService,
  ) {}

  async getFeed(userId: string, limit = 20, offset = 0) {
    const postIds = await this.redisFeed.getFeed(
      userId,
      limit,
      offset,
    );

    if (!postIds.length) {
      return { data: [], nextCursor: null };
    }

    const [posts, counters] = await Promise.all([
      this.postService.getPostsByIds(postIds),
      this.redisCounter.getBulkCounts(postIds),
    ]);

    const postMap = new Map(posts.map((p) => [p.id, p]));

    const feed = postIds
      .map((postId) => {
        const post = postMap.get(postId);
        if (!post) return null;

        const counter = counters[postId] || {
          likes: 0,
          comments: 0,
        };

        return {
          ...post,
          likes: counter.likes,
          comments: counter.comments,
        };
      })
      .filter(Boolean);

    return {
      data: feed,
      nextCursor:
        postIds.length === limit ? offset + limit : null,
    };
  }
}