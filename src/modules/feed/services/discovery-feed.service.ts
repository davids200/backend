import {
  Injectable,
} from '@nestjs/common';

import { FeedQueryService }
from './feed-query.service';

@Injectable()
export class DiscoveryFeedService {

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

    // ================================================
    // DEDUPLICATION MAP
    // ================================================

    const results =
      new Map<string, any>();

    // ================================================
    // HOME FEED
    // ================================================

    const homeFeed =await this.feedQuery.getHomeFeed({
          userId,
          limit,
          cursor,
        });

    for (const item of homeFeed.items) {
      const id = item?.data?.id;
      if (id) {
        results.set(id,item,);
      }
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

      for (const item of locationFeed.items) {
        const id = item?.data?.id;
        if (id) {
          results.set(id,item,);
        }
      }
    }




    
    // ================================================
    // HASHTAG FEEDS
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
        const item
        of hashtagFeed.items
      ) {

        const id =
          item?.data?.id;

        if (id) {

          results.set(
            id,
            item,
          );
        }
      }
    }

    // ================================================
    // MERGE
    // ================================================

    const items =
      Array.from(
        results.values(),
      );

    // ================================================
    // SORT
    // ================================================

    items.sort(

      (a, b) =>

        new Date(
          b.createdAt,
        ).getTime()

        -

        new Date(
          a.createdAt,
        ).getTime(),
    );

    // ================================================
    // RESPONSE
    // ================================================

    return {

      items:

        items.slice(
          0,
          limit,
        ),

      nextCursor:

        items.length

          ? items[
              items.length - 1
            ].createdAt

          : null,
    };
  }
}