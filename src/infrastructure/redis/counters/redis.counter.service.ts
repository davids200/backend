import {
  Injectable,
} from '@nestjs/common';

import Redis
from 'ioredis';

@Injectable()
export class RedisCounterService {

  private redis =
    new Redis({
      host:'localhost',
      port:6379,
    });

  // =====================================================
  // KEY BUILDERS
  // =====================================================

  private likesKey(
    postId:string,
  ){
    return `post:${postId}:likes`;
  }

  private commentsKey(
    postId:string,
  ){
    return `post:${postId}:comments`;
  }

  private viewsKey(
    postId:string,
  ){
    return `post:${postId}:views`;
  }

  private bookmarksKey(
    postId:string,
  ){
    return `post:${postId}:bookmarks`;
  }

  private repostsKey(
    postId:string,
  ){
    return `post:${postId}:reposts`;
  }

  private dwellKey(
    postId:string,
  ){
    return `post:${postId}:dwell`;
  }

  // =====================================================
  // LIKES
  // =====================================================

  async incrementLikes(
    postId:string,
  ){
    await this.redis.incr(
      this.likesKey(postId),
    );
  }

  async decrementLikes(
    postId:string,
  ){
    await this.redis.decr(
      this.likesKey(postId),
    );
  }

  async getLikesCount(
    postId:string,
  ){

    const value =
      await this.redis.get(
        this.likesKey(postId),
      );

    return Number(value || 0);
  }

  // =====================================================
  // COMMENTS
  // =====================================================

  async incrementComments(
    postId:string,
  ){
    await this.redis.incr(
      this.commentsKey(postId),
    );
  }

  async decrementComments(
    postId:string,
  ){
    await this.redis.decr(
      this.commentsKey(postId),
    );
  }

  async getCommentsCount(
    postId:string,
  ){

    const value =
      await this.redis.get(
        this.commentsKey(postId),
      );

    return Number(value || 0);
  }

  // =====================================================
  // VIEWS
  // =====================================================

  async incrementViews(
    postId:string,
  ){
    await this.redis.incr(
      this.viewsKey(postId),
    );
  }

  async getViewsCount(
    postId:string,
  ){

    const value =
      await this.redis.get(
        this.viewsKey(postId),
      );

    return Number(value || 0);
  }

  // =====================================================
  // BOOKMARKS
  // =====================================================

  async incrementBookmarks(
    postId:string,
  ){
    await this.redis.incr(
      this.bookmarksKey(postId),
    );
  }

  async decrementBookmarks(
    postId:string,
  ){
    await this.redis.decr(
      this.bookmarksKey(postId),
    );
  }

  async getBookmarksCount(
    postId:string,
  ){

    const value =
      await this.redis.get(
        this.bookmarksKey(postId),
      );

    return Number(value || 0);
  }

  // =====================================================
  // REPOSTS
  // =====================================================

  async incrementReposts(
    postId:string,
  ){
    await this.redis.incr(
      this.repostsKey(postId),
    );
  }

  async decrementReposts(
    postId:string,
  ){
    await this.redis.decr(
      this.repostsKey(postId),
    );
  }

  async getRepostsCount(
    postId:string,
  ){

    const value =
      await this.redis.get(
        this.repostsKey(postId),
      );

    return Number(value || 0);
  }

  // =====================================================
  // DWELL TIME
  // =====================================================

  async addDwellTime(

    postId:string,

    dwellTimeMs:number,
  ){

    await this.redis.incrby(

      this.dwellKey(postId),

      dwellTimeMs,
    );
  }

  async getDwellTime(
    postId:string,
  ){

    const value =
      await this.redis.get(
        this.dwellKey(postId),
      );

    return Number(value || 0);
  }
}