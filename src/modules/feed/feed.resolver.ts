import {
  Resolver,
  Query,
  Args,
} from '@nestjs/graphql';

import {
  UseGuards,
} from '@nestjs/common';

import { FeedService }
from './feed.service';

import { FeedResponse }
from './dto/feed.response';

import { GqlAuthGuard }
from '../auth/guards/gql-auth.guard';

import { CurrentUser }
from '../auth/decorators/current-user.decorator';

@Resolver()
export class FeedResolver {

  constructor(

    private readonly feedService:
      FeedService,
  ) {}

  // =====================================================
  // HOME FEED
  // =====================================================

  @Query(() => FeedResponse)

  @UseGuards(
    GqlAuthGuard,
  )

  async homeFeed(

    @CurrentUser()
    user: any,

    @Args('limit', {
      nullable: true,
      defaultValue: 20,
    })
    limit?: number,

    @Args('cursor', {
      nullable: true,
    })
    cursor?: Date,
  ) {

    return this.feedService
      .getHomeFeed({

        userId:
          user.id,

        limit,

        cursor,
      });
  }

  // =====================================================
  // USER PROFILE FEED
  // =====================================================

  @Query(() => FeedResponse)

  async userFeed(

    @Args('authorId')
    authorId: string,

    @Args('limit', {
      nullable: true,
      defaultValue: 20,
    })
    limit?: number,

    @Args('cursor', {
      nullable: true,
    })
    cursor?: Date,
  ) {

    return this.feedService
      .getUserFeed({

        authorId,

        limit,

        cursor,
      });
  }

  // =====================================================
  // LOCATION FEED
  // =====================================================

  @Query(() => FeedResponse)

  async locationFeed(

    @Args('locationId')
    locationId: string,

    @Args('limit', {
      nullable: true,
      defaultValue: 20,
    })
    limit?: number,

    @Args('cursor', {
      nullable: true,
    })
    cursor?: Date,
  ) {

    return this.feedService
      .getLocationFeed({

        locationId,

        limit,

        cursor,
      });
  }

  // =====================================================
  // HASHTAG FEED
  // =====================================================

  @Query(() => FeedResponse)

  async hashtagFeed(

    @Args('hashtag')
    hashtag: string,

    @Args('limit', {
      nullable: true,
      defaultValue: 20,
    })
    limit?: number,

    @Args('cursor', {
      nullable: true,
    })
    cursor?: Date,
  ) {

    return this.feedService
      .getHashtagFeed({

        hashtag,

        limit,

        cursor,
      });
  }

  // =====================================================
  // DISCOVERY FEED
  // =====================================================

  @Query(() => FeedResponse)

  @UseGuards(
    GqlAuthGuard,
  )

  async discoveryFeed(

    @CurrentUser()
    user: any,

    @Args('locationId', {
      nullable: true,
    })
    locationId?: string,

    @Args('hashtags', {
      nullable: true,
      type: () => [String],
    })
    hashtags?: string[],

    @Args('limit', {
      nullable: true,
      defaultValue: 20,
    })
    limit?: number,

    @Args('cursor', {
      nullable: true,
    })
    cursor?: Date,
  ) {

    return this.feedService
      .getDiscoveryFeed({

        userId:
          user.id,

        locationId,

        hashtags,

        limit,

        cursor,
      });
  }
}