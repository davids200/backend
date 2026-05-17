import {
  Injectable,
} from '@nestjs/common';
import { RedisService } from '../../redis.service';
 

@Injectable()
export class RedisPostCounterService {

  constructor(

    private readonly redis:
      RedisService,
  ) {}

  async incrementPosts(
    userId:string,
  ){

    await this.redis.incr(

      `user:${userId}:posts`,
    );
  }

  async decrementPosts(
    userId:string,
  ){

    const key =
      `user:${userId}:posts`;

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

  async getPostsCount(
    userId:string,
  ){

    const count =
      await this.redis.get(

        `user:${userId}:posts`,
      );

    return Number(
      count || 0,
    );
  }
}