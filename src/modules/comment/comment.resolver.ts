// src/modules/comment/comment.resolver.ts

import {
  Resolver,
  Mutation,
  Query,
  Args,
} from '@nestjs/graphql';

import {
  UseGuards,
} from '@nestjs/common';

import { CommentService }
from './comment.service';

import { GqlAuthGuard }
from '../auth/guards/gql-auth.guard';

import { CurrentUser }
from '../auth/decorators/current-user.decorator';

import { CreateCommentInput }
from './dto/create-comment.input';

import { ReplyCommentInput }
from './dto/reply-comment.input';

import { CommentModel }
from './comment.model';

@Resolver(() => CommentModel)
export class CommentResolver {

  constructor(
    private readonly service:CommentService,
  ) {}

  // =====================================================
  // CREATE ROOT COMMENT
  // =====================================================

  @Mutation(() => CommentModel,{
    name:'createComment',
  })
  @UseGuards(GqlAuthGuard)
  async createComment(

    @CurrentUser()
    user:any,

    @Args('input')
    input:CreateCommentInput,
  ){

    return this.service.createComment(
      user.id,
      input,
    );
  }

  // =====================================================
  // REPLY COMMENT
  // =====================================================

  @Mutation(() => CommentModel,{
    name:'replyComment',
  })
  @UseGuards(GqlAuthGuard)
  async replyComment(

    @CurrentUser()
    user:any,

    @Args('data')
    data:ReplyCommentInput,
  ){

    return this.service.replyComment(
      user.id,
      data,
    );
  }

  // =====================================================
  // GET ROOT COMMENTS
  // =====================================================

  @Query(() => [CommentModel],{
    name:'getComments',
  })
  async getComments(

    @Args('postId')
    postId:string,

    @Args('limit',{
      nullable:true,
    })
    limit?:number,

    @Args('cursor',{
      nullable:true,
    })
    cursor?:Date,
  ){

    return this.service.getComments({

      postId,

      limit,

      cursor,
    });
  }

  // =====================================================
  // GET REPLIES
  // =====================================================

  @Query(() => [CommentModel],{
    name:'getReplies',
  })
  async getReplies(

    @Args('rootId')
    rootId:string,

    @Args('limit',{
      nullable:true,
    })
    limit?:number,

    @Args('offset',{
      nullable:true,
    })
    offset?:number,
  ){

    return this.service.getReplies({

      rootId,

      limit,

      offset,
    });
  }


@Mutation(() => Boolean)

@UseGuards(
  GqlAuthGuard,
)

async deleteComment(

  @CurrentUser()
  user:any,

  @Args('commentId')
  commentId:string,
){

  return this.service
    .deleteComment(

      user.id,

      commentId,
    );
}



}