import {
  Injectable,
} from '@nestjs/common';

import { FeedQueryService }
from './feed-query.service';

import { DiscoveryFeedService }
from './discovery-feed.service';

@Injectable()
export class FeedService
{
  constructor(

    private readonly feedQuery:
      FeedQueryService,

    private readonly discovery:
      DiscoveryFeedService,
  ) {}

  // =====================================================
  // HOME FEED
  // =====================================================

  async getHomeFeed(params: {

    userId: string;

    limit?: number;

    cursor?: Date;
  }) {

    return this.feedQuery
      .getHomeFeed(
        params,
      );
  }

  // =====================================================
  // USER FEED
  // =====================================================

  async getUserFeed(params: {

    authorId: string;

    limit?: number;

    cursor?: Date;
  }) {

    const bucketDate =
      (
        params.cursor ||
        new Date()
      )
        .toISOString()
        .split('T')[0];

    return this.feedQuery
      .getUserFeed({

        ...params,

        bucketDate,
      });
  }

  // =====================================================
  // LOCATION FEED
  // =====================================================

  async getLocationFeed(params: {

    locationId: string;

    limit?: number;

    cursor?: Date;
  }) {

    return this.feedQuery
      .getLocationFeed(
        params,
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

    return this.feedQuery
      .getHashtagFeed(
        params,
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

    return this.discovery
      .getDiscoveryFeed(
        params,
      );
  }
}