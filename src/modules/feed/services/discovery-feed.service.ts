import {
  Injectable,
} from '@nestjs/common';

import { FeedQueryService }
from './feed-query.service';

@Injectable()
export class DiscoveryFeedService
{
  constructor(

    private readonly feedQuery:
      FeedQueryService,
  ) {}

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

    const homeFeed =
      await this.feedQuery
        .getHomeFeed({

          userId,

          limit,

          cursor,
        });

    for (
      const post of homeFeed.posts
    ) {

      results.set(
        post.id,
        post,
      );
    }

    // ================================================
    // LOCATION FEED
    // ================================================

    if (locationId) {

      const locationFeed =
        await this.feedQuery
          .getLocationFeed({

            locationId,

            limit,

            cursor,
          });

      for (
        const post
        of locationFeed.posts
      ) {

        results.set(
          post.id,
          post,
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

      const hashtagFeed =
        await this.feedQuery
          .getHashtagFeed({

            hashtag,

            limit,

            cursor,
          });

      for (
        const post
        of hashtagFeed.posts
      ) {

        results.set(
          post.id,
          post,
        );
      }
    }

    // ================================================
    // MERGE + SORT
    // ================================================

    const posts =
      Array.from(
        results.values(),
      );

    posts.sort(

      (a, b) =>

        new Date(
          b.createdAt,
        ).getTime()

        -

        new Date(
          a.createdAt,
        ).getTime(),
    );

    return {

      posts:
        posts.slice(
          0,
          limit,
        ),

      nextCursor:

        posts.length

          ? posts[
              posts.length - 1
            ].createdAt

          : null,
    };
  }
}