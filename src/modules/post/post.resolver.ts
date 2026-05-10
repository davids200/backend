import {  Resolver,  Mutation,  Args,  Query,} from '@nestjs/graphql';
import {  UseGuards,  Logger,} from '@nestjs/common';
import { PostService }from './post.service';
import { PostEntity }from './post.entity';
import { CreatePostInput }from './dto/create-post.input';
import { GqlAuthGuard }from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => PostEntity)
export class PostResolver {
private readonly logger =    new Logger(PostResolver.name,);

  constructor(
    private readonly posts:PostService,
  ) {}

  // =====================================================
  // CREATE POST
  // =====================================================

  @UseGuards(
    GqlAuthGuard,
  )

  @Mutation(() => PostEntity)

  async createPost(
    @CurrentUser()
    user: any,
    @Args('data')data: CreatePostInput,
  ) {

    // ================================================
    // DEBUG USER PAYLOAD
    // ================================================

    this.logger.log(user);

    const userId =
      user?.userId
      || user?.id
      || user?.sub;

    return this.posts.createPost(

      userId,

      data,
    );
  }

  // =====================================================
  // DELETE POST
  // =====================================================

  @UseGuards(
    GqlAuthGuard,
  )

  @Mutation(() => Boolean)

  async deletePost(

    @CurrentUser()
    user: any,

    @Args('postId')
    postId: string,
  ) {

    const userId =
      user?.userId
      || user?.id
      || user?.sub;

    return this.posts.deletePost(

      postId,

      userId,
    );
  }

  // =====================================================
  // GET POSTS BY IDS
  // =====================================================

  @Query(() => [PostEntity])

  async getPostsByIds(

    @Args({
      name: 'postIds',
      type: () => [String],
    })

    postIds: string[],
  ) {

    return this.posts.getPostsByIds(
      postIds,
    );
  }
}