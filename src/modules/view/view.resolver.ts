import { Resolver,Mutation,Args } from '@nestjs/graphql';

import { UseGuards } from '@nestjs/common';

import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

import { CurrentUser } from '../auth/decorators/current-user.decorator';

import { ViewService } from './view.service';

import { ViewPostInput } from './dto/view-post.input';

@Resolver()
export class ViewResolver {

  constructor(
    private readonly viewService:ViewService,
  ) {}

  @Mutation(() => Boolean,{
    name:'viewPost',
  })
  @UseGuards(GqlAuthGuard)
  async viewPost(

    @CurrentUser()
    user:any,

    @Args('input')
    input:ViewPostInput,
  ){

    return this.viewService.viewPost(
      user.id,
      input,
    );
  }
}