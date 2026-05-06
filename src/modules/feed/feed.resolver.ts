import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { FeedService } from './feed.service'; 
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FeedResponse } from './dto/feed.response';
// import { GqlAuthGuard } from '../auth/gql-auth.guard';
// import { CurrentUser } from '../auth/current-user.decorator';

@Resolver()
export class FeedResolver {
  constructor(private readonly feedService: FeedService) {}


 @Query(() => FeedResponse)
@Query(() => FeedResponse)
async getFeed(
  @CurrentUser() user: any,
  @Args('limit', { type: () => Number, defaultValue: 20 }) limit: number,
  @Args('cursor', { type: () => Number, nullable: true }) cursor?: number,
) {
  return this.feedService.getFeed(user, limit, cursor);
}

}