import {
  Injectable,
} from '@nestjs/common';
import { RedisService } from '../../redis.service';
 

@Injectable()
export class RedisLikeCounterService {

  constructor(

    private readonly redis:
      RedisService,
  ) {}

  async incrementLikes(
    postId:string,
  ){

    await this.redis.incr(

      `post:${postId}:likes`,
    );
  }

  async decrementLikes(
    postId:string,
  ){

    const key =
      `post:${postId}:likes`;

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

  async getLikesCount(
    postId:string,
  ){

    const count =
      await this.redis.get(

        `post:${postId}:likes`,
      );

    return Number(
      count || 0,
    );
  }
}