import {
  Resolver,
  Mutation,
  Args,
  Query,
} from '@nestjs/graphql';

import {
  UseGuards,
} from '@nestjs/common';

import { PostService }
from './post.service';

import { CreatePostInput }
from './dto/create-post.input';

import { PostModel }
from './post.model';

import { FeedService }
from '../feed/feed.service';

import { FeedResponse }
from '../feed/dto/feed.response';

import { UserEntity }
from '../user/entities/user.entity';

import { GqlAuthGuard }
from '../auth/guards/gql-auth.guard';

import { CurrentUser }
from '../auth/decorators/current-user.decorator';

@Resolver(() => PostModel)
export class PostResolver {
  constructor(
    private readonly postService:
      PostService,

    private readonly feedService:
      FeedService,
  ) {}

  // =====================================================
  // GET USER FEED
  // =====================================================

  @Query(() => FeedResponse)
  @UseGuards(GqlAuthGuard)
  async getFeed(
    @CurrentUser()
    user: UserEntity,

    @Args('limit', {
      nullable: true,
      defaultValue: 20,
    })
    limit: number,

    @Args('cursor', {
      nullable: true,
    })
    cursor?: number,
  ) {

    return this.feedService.getFeed(
      user,
      limit,
      cursor,
    );
  }

  // =====================================================
  // CREATE POST
  // =====================================================

  @Mutation(() => PostModel)
  @UseGuards(GqlAuthGuard)
  async createPost(
    @CurrentUser()
    user: UserEntity,

    @Args('data')
    data: CreatePostInput,
  ) {

    return this.postService.createPost(
      user.id,
      data,
    );
  }
}