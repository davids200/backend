import {
  Injectable,
} from '@nestjs/common';

import { RedisLikeCounterService }
from '../like/redis.like.counter.service';

import { RedisCommentCounterService }
from '../comment/redis.comment.counter.service';


import { RedisRepostCounterService }
from '../repost/redis.repost.counter.service';

import { RedisViewCounterService }
from '../view/redis.view.counter.service';
import { RedisBookmarkCounterService } from '../bookmark/redis.bookmark.counter';

@Injectable()
export class RedisEngagementCounterService {

  constructor(

    private readonly likes:
      RedisLikeCounterService,

    private readonly comments:
      RedisCommentCounterService,

    private readonly bookmarks:
      RedisBookmarkCounterService,

    private readonly reposts:
      RedisRepostCounterService,

    private readonly views:
      RedisViewCounterService,
  ) {}

  // =====================================================
  // GET AGGREGATED ENGAGEMENT
  // =====================================================

  async getEngagement(
    postId:string,
  ){

    const [

      likes,

      comments,

      bookmarks,

      reposts,

      views,

      dwellTimeMs,

    ] = await Promise.all([

      this.likes
        .getLikesCount(
          postId,
        ),

      this.comments
        .getCommentsCount(
          postId,
        ),

      this.bookmarks
        .getBookmarksCount(
          postId,
        ),

      this.reposts
        .getRepostsCount(
          postId,
        ),

      this.views
        .getViewsCount(
          postId,
        ),

      this.views
        .getDwellTime(
          postId,
        ),
    ]);

    return {

      likes,

      comments,

      bookmarks,

      reposts,

      views,

      dwellTimeMs,
    };
  }
}