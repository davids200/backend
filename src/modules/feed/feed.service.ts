import {
  Injectable,
} from '@nestjs/common';
import { FeedQueryService } from './services/feed-query.service';


@Injectable()
export class FeedService
{
  constructor(

    private readonly queryService:
      FeedQueryService,
  ) {}

  // =====================================================
  // HOME FEED
  // =====================================================

  async getHomeFeed(params: {

    userId: string;

    limit?: number;

    cursor?: Date;
  }) {

    return this.queryService
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

    return this.queryService
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

    return this.queryService
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

    return this.queryService
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

    return this.queryService
      .getDiscoveryFeed(
        params,
      );
  }
}