// src/modules/feed/services/feed-query.service.ts

import {
  Injectable,
} from '@nestjs/common';

import { HomeFeedRepository }
from '../../../infrastructure/scylladb/repositories/feed/home.feed.repo';

import { UserFeedRepository }
from '../../../infrastructure/scylladb/repositories/feed/user.feed.repo';

import { LocationFeedRepository }
from '../../../infrastructure/scylladb/repositories/feed/location.feed.repo';

import { HashtagFeedRepository }
from '../../../infrastructure/scylladb/repositories/feed/hashtag.feed.repo';

import { PostService }
from '../../post/post.service';

@Injectable()
export class FeedQueryService
{
  constructor(

    private readonly homeFeedRepo:
      HomeFeedRepository,

    private readonly userFeedRepo:
      UserFeedRepository,

    private readonly locationFeedRepo:
      LocationFeedRepository,

    private readonly hashtagFeedRepo:
      HashtagFeedRepository,

    private readonly postService:
      PostService,
  ) {}

  // =====================================================
  // HOME FEED
  // =====================================================

  async getHomeFeed(params: {

    userId: string;

    limit?: number;

    cursor?: Date;
  }) {

    const rows =
      await this.homeFeedRepo
        .getFeed(params);

    return this.buildFeedResponse(
      rows,
    );
  }

  // =====================================================
  // USER FEED
  // =====================================================

  async getUserFeed(params: {

    authorId: string;

    bucketDate: string;

    limit?: number;

    cursor?: Date;
  }) {

    const rows =
      await this.userFeedRepo
        .getPosts(params);

    return this.buildFeedResponse(
      rows,
    );
  }

  // =====================================================
  // LOCATION FEED
  // =====================================================

  async getLocationFeed(params: {

    locationId: string;

    limit?: number;

    cursor?: Date;
  }) {

    const rows =
      await this.locationFeedRepo
        .getFeed(params);

    return this.buildFeedResponse(
      rows,
    );
  }

  // =====================================================
  // HASHTAG FEED
  // =====================================================

  async getHashtagFeed(params: {

    hashtag: string;

    limit?: number;

    cursor?: Date;
  }) {

    const normalized =
      params.hashtag
        .replace('#', '')
        .trim()
        .toLowerCase();

    const rows =
      await this.hashtagFeedRepo
        .getFeed({

          hashtag:
            normalized,

          limit:
            params.limit,

          cursor:
            params.cursor,
        });

    return this.buildFeedResponse(
      rows,
    );
  }

  // =====================================================
  // DISCOVERY FEED
  // =====================================================

  async getDiscoveryFeed(params: {

    userId: string;

    locationId?: string;

    hashtags?: string[];

    limit?: number;

    cursor?: Date;
  }) {

    const {

      userId,

      locationId,

      hashtags = [],

      limit = 20,

      cursor,
    } = params;

    const results =
      new Map<string, any>();

    // ================================================
    // HOME FEED
    // ================================================

    const homeRows =
      await this.homeFeedRepo
        .getFeed({

          userId,

          limit,

          cursor,
        });

    for (
      const row of homeRows
    ) {

      results.set(
        row.post_id,
        row,
      );
    }

    // ================================================
    // LOCATION FEED
    // ================================================

    if (locationId) {

      const locationRows =
        await this.locationFeedRepo
          .getFeed({

            locationId,

            limit,

            cursor,
          });

      for (
        const row of locationRows
      ) {

        results.set(
          row.post_id,
          row,
        );
      }
    }

    // ================================================
    // HASHTAG FEED
    // ================================================

    for (
      const rawHashtag
      of hashtags
    ) {

      const hashtag =
        rawHashtag
          .replace('#', '')
          .trim()
          .toLowerCase();

      const hashtagRows =
        await this.hashtagFeedRepo
          .getFeed({

            hashtag,

            limit,

            cursor,
          });

      for (
        const row of hashtagRows
      ) {

        results.set(
          row.post_id,
          row,
        );
      }
    }

    const rows =
      Array.from(
        results.values(),
      );

    return this.buildFeedResponse(
      rows,
    );
  }

  // =====================================================
  // BUILD RESPONSE
  // =====================================================

  private async buildFeedResponse(
    rows: any[],
  ) {

    const postIds =
      rows.map(
        (row) =>
          row.post_id,
      );

    const posts =
      await this.postService
        .getPostsByIds(
          postIds,
        );

    const nextCursor =
      rows.length
        ? rows[
            rows.length - 1
          ].created_at
        : null;

    return {

      posts,

      nextCursor,
    };
  }
}