import {
  Resolver,
  Mutation,
  Query,
  Args,
} from '@nestjs/graphql';

import { FollowService }
from './follow.service';
 

import { FollowUserInput }
from './dto/follow-user.input';
import { FollowEntity } from './entities/follow.entity';

@Resolver()
export class FollowResolver {

  constructor(

    private readonly service:
      FollowService,
  ) {}

  // =====================================================
  // FOLLOW USER
  // =====================================================

  @Mutation(() => FollowEntity)
  async followUser(

    @Args('followerId')
    followerId: string,

    @Args('data')
    data: FollowUserInput,
  ) {

    return this.service.followUser(

      followerId,

      data.followingId,
    );
  }

  // =====================================================
  // UNFOLLOW USER
  // =====================================================

  @Mutation(() => Boolean)
  async unfollowUser(

    @Args('followerId')
    followerId: string,

    @Args('followingId')
    followingId: string,
  ) {

    return this.service.unfollowUser(

      followerId,

      followingId,
    );
  }

  // =====================================================
  // GET FOLLOWERS
  // =====================================================

  @Query(() => [FollowEntity])
  async followers(

    @Args('userId')
    userId: string,
  ) {

    return this.service.getFollowers(
      userId,
    );
  }

  // =====================================================
  // GET FOLLOWING
  // =====================================================

  @Query(() => [FollowEntity])
  async following(

    @Args('userId')
    userId: string,
  ) {

    return this.service.getFollowing(
      userId,
    );
  }
}