import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { RedisFeedService }
from '../../infrastructure/redis/feed/redis.feed.service';

@Injectable()
export class FeedService {
  private readonly logger =
    new Logger(FeedService.name);

  constructor(
    private readonly redisFeed:
      RedisFeedService,
  ) {}

  // =====================================================
  // PROCESS POST EVENT
  // =====================================================

  async processPost(params: {
    postId: string;
    userId: string;
    locationId?: string;
    createdAt: Date;
  }) {

    const {
      postId,
      userId,
      locationId,
      createdAt,
    } = params;

    // this.logger.log(
    //   `Processing post: ${postId}`,
    // );

    // ================================================
    // PLACEHOLDER
    // Feed fanout logic handled here
    // ================================================

    return true;
  }

  // =====================================================
  // GET USER FEED
  // =====================================================

  async getFeed(
    user: {
      id: string;
      locationId?: string;
    },

    limit = 20,

    cursor?: number,
  ) {

    // ================================================
    // FOLLOWING FEED
    // ================================================

    const followingFeed =
      await this.redisFeed
        .getFeedWithCursor(
          user.id,
          limit,
          cursor,
        );

    // ================================================
    // GLOBAL TRENDING
    // ================================================

    const globalTrending =
      await this.redisFeed
        .getGlobalTrending(
          limit,
        );

    // ================================================
    // LOCATION TRENDING
    // ================================================

    let localTrending: string[] = [];

    if (user.locationId) {

      localTrending =
        await this.redisFeed
          .getLocationTrending(
            user.locationId,
            limit,
          );
    }

    // ================================================
    // MERGE FEEDS
    // ================================================

    const merged = [
      ...followingFeed,
      ...globalTrending,
      ...localTrending,
    ];

    // ================================================
    // REMOVE DUPLICATES
    // ================================================

    const uniquePosts = [
      ...new Set(merged),
    ];

    // ================================================
    // NEXT CURSOR
    // ================================================

    const nextCursor =
      (cursor || 0) + limit;

    return {
      posts: uniquePosts,
      nextCursor,
    };
  }
}