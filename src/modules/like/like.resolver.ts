import { Resolver,Mutation,Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { LikeService }
from './like.service';

import { GqlAuthGuard }
from '../auth/guards/gql-auth.guard';

import { CurrentUser }
from '../auth/decorators/current-user.decorator';

@Resolver()
export class LikeResolver {

  constructor(
    private readonly likeService: LikeService,
  ) {}

  // =====================================================
  // LIKE POST
  // =====================================================

  @Mutation(() => Boolean,{ name:'likePost' })
  @UseGuards(GqlAuthGuard)

  async likePost(

    @CurrentUser()
    user:any,

    @Args('postId')
    postId:string,
  ) {

    return this.likeService.likePost(
      user.id,
      postId,
    );
  }

  // =====================================================
  // UNLIKE POST
  // =====================================================

  @Mutation(() => Boolean,{ name:'unlikePost' })
  @UseGuards(GqlAuthGuard)

  async unlikePost(

    @CurrentUser()
    user:any,

    @Args('postId')
    postId:string,
  ) {

    return this.likeService.unlikePost(
      user.id,
      postId,
    );
  }
}