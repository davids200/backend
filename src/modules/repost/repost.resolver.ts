// src/modules/repost/repost.resolver.ts

import {
  Resolver,
  Mutation,
  Args,
} from '@nestjs/graphql';

import {
  UseGuards,
} from '@nestjs/common';

import { RepostService }
from './repost.service';

import { RepostEntity }
from './repost.entity';

import { RepostInput }
from './dto/repost.input';

import { GqlAuthGuard }
from '../auth/guards/gql-auth.guard';

import { CurrentUser }
from '../auth/decorators/current-user.decorator';

@Resolver(() => RepostEntity)
export class RepostResolver
{
  constructor(

    private readonly repostService:
      RepostService,
  ) {}

  @Mutation(() => RepostEntity)
  @UseGuards(GqlAuthGuard)
  async repostPost(

    @CurrentUser()
    user: any,

    @Args('data')
    data: RepostInput,
  ) {

    return this.repostService
      .repostPost(

        user.id,

        data,
      );
  }




@Mutation(() => Boolean)

@UseGuards(
  GqlAuthGuard,
)

async removeRepost(

  @CurrentUser()
  user:any,

  @Args('postId')
  postId:string,
){

  return this.repostService
    .removeRepost(

      user.id,

      postId,
    );

}
}