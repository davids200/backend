import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { LikeService } from './like.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LikeTargetType } from './like.entity';

@Resolver()
export class LikeResolver {
  constructor(private readonly likeService: LikeService) {}

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  like(
    @CurrentUser() user: any,
    @Args('targetId') targetId: string,
    @Args('targetType') targetType: LikeTargetType,
    @Args('authorId') authorId: string,
  ) {
    return this.likeService.like(
      user.id,
      targetId,
      targetType,
      authorId,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  unlike(
    @CurrentUser() user: any,
    @Args('targetId') targetId: string,
    @Args('targetType') targetType: LikeTargetType,
  ) {
    return this.likeService.unlike(
      user.id,
      targetId,
      targetType,
    );
  }
}