import {
  Injectable,
} from '@nestjs/common';
import { RedisService } from '../../redis.service';
 

@Injectable()
export class RedisBookmarkCounterService {

  constructor(
    private readonly redis:RedisService,
  ) {}

  async incrementBookmarks(
    postId:string,
  ){

    await this.redis.incr(

      `post:${postId}:bookmarks`,
    );
  }

  async decrementBookmarks(
    postId:string,
  ){

    const key =
      `post:${postId}:bookmarks`;

    const current =
      Number(

        await this.redis.get(
          key,
        ) || 0,
      );

    if (current <= 0){

      await this.redis.set(
        key,
        '0',
      );

      return;
    }

    await this.redis.decr(
      key,
    );
  }

  async getBookmarksCount(
    postId:string,
  ){

    const count =
      await this.redis.get(

        `post:${postId}:bookmarks`,
      );

    return Number(
      count || 0,
    );
  }
}