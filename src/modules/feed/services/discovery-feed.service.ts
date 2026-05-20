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

  async getDiscoveryFeed(params:{
    userId:string;
    locationId?:string;
    hashtags?:string[];
    limit?:number;
    cursor?:Date;
  }){

    const {
      userId,
      locationId,
      hashtags = [],
      limit = 20,
      cursor,
    } = params;

    // ================================================
    // BUCKET DATE
    // ================================================

    const bucketDate =

      new Date()
        .toISOString()
        .split('T')[0];

    // ================================================
    // DEDUPLICATION MAP
    // ================================================

    const results =
      new Map<string,any>();

    // ================================================
    // HOME FEED
    // ================================================

    const homeFeed =
      await this.feedQuery
        .getHomeFeed({

          userId,

          bucketDate,

          limit,

          cursor,
        });

    for (
      const item
      of homeFeed.data
    ){

      const id =
        item?.postId;

      if (id){

        results.set(
          id,
          item,
        );
      }
    }

    // ================================================
    // LOCATION FEED
    // ================================================

    if (locationId){

      const locationFeed =
        await this.feedQuery
          .getLocationFeed({

            locationId,

            bucketDate,

            limit,

            cursor,
          });

      for (
        const item
        of locationFeed.data
      ){

        const id =
          item?.postId;

        if (id){

          results.set(
            id,
            item,
          );
        }
      }
    }

    // ================================================
    // HASHTAG FEEDS
    // ================================================

    for (
      const rawHashtag
      of hashtags
    ){

      const hashtag =

        rawHashtag
          .replace('#','')
          .trim()
          .toLowerCase();

      const hashtagFeed =
        await this.feedQuery
          .getHashtagFeed({

            hashtag,

            bucketDate,

            limit,

            cursor,
          });

      for (
        const item
        of hashtagFeed.data
      ){

        const id =
          item?.postId;

        if (id){

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

      (a,b) => {

        const scoreA =
          a.liveScore || 0;

        const scoreB =
          b.liveScore || 0;

        if (
          scoreB !== scoreA
        ){

          return (
            scoreB - scoreA
          );
        }

        return (

          new Date(
            b.createdAt,
          ).getTime()

          -

          new Date(
            a.createdAt,
          ).getTime()
        );
      },
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