import {
  Injectable,
} from '@nestjs/common';  
import { RedisService } from '../../redis.service';


@Injectable()
export class RedisCommentCounterService {

  constructor(
  private readonly redis: RedisService,
  ) {}

  async incrementComments(
    postId:string,
  ){

    await this.redis.incr(

      `post:${postId}:comments`,
    );
  }

  async decrementComments(
    postId:string,
  ){

    const key =
      `post:${postId}:comments`;

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

  async getCommentsCount(
    postId:string,
  ){

    const count =
      await this.redis.get(

        `post:${postId}:comments`,
      );

    return Number(
      count || 0,
    );
  }
}