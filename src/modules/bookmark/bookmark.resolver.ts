import {
  Resolver,
  Mutation,
  Args,
} from '@nestjs/graphql';

import {
  UseGuards,
} from '@nestjs/common';

import { BookmarkService }
from './bookmark.service';

import { GqlAuthGuard }
from '../auth/guards/gql-auth.guard';

import { CurrentUser }
from '../auth/decorators/current-user.decorator';

import { BookmarkPostInput }
from './dto/bookmark-post.input';

@Resolver()
export class BookmarkResolver {

  constructor(

    private readonly service:
      BookmarkService,
  ) {}

  // =====================================================
  // BOOKMARK POST
  // =====================================================

  @Mutation(() => Boolean,{
    name:'bookmarkPost',
  })
  @UseGuards(GqlAuthGuard)
  async bookmarkPost(

    @CurrentUser()
    user:any,

    @Args('input')
    input:BookmarkPostInput,
  ){

    return this.service.bookmarkPost(

      user.id,

      input.postId,
    );
  }

  // =====================================================
  // REMOVE BOOKMARK
  // =====================================================

  @Mutation(() => Boolean,{
    name:'removeBookmark',
  })
  @UseGuards(GqlAuthGuard)
  async removeBookmark(

    @CurrentUser()
    user:any,

    @Args('input')
    input:BookmarkPostInput,
  ){

    return this.service.removeBookmark(

      user.id,

      input.postId,
    );
  }
}