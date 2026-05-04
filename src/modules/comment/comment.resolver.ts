import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { CommentService } from './comment.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver()
export class CommentResolver {
  constructor(private service: CommentService) {}

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  createComment(
    @CurrentUser() user: any,
    @Args('data') data: any,
  ) {
    return this.service.createComment(user.id, data);
  }

  @Mutation(() => String)
  @UseGuards(GqlAuthGuard)
  replyComment(
    @CurrentUser() user: any,
    @Args('data') data: any,
  ) {
    return this.service.replyComment(user.id, data);
  }

  @Query(() => String)
  getComments(@Args('postId') postId: string) {
    return this.service.getComments(postId);
  }

  @Query(() => String)
  getReplies(@Args('rootId') rootId: string) {
    return this.service.getReplies(rootId);
  }
}