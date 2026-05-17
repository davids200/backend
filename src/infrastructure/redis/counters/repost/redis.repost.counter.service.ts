import {
  Injectable,
} from '@nestjs/common'; 
import { RedisService } from '../../redis.service';

@Injectable()
export class RedisRepostCounterService {

  constructor(

    private readonly redis:
      RedisService,
  ) {}

  async incrementReposts(
    postId:string,
  ){

    await this.redis.incr(

      `post:${postId}:reposts`,
    );
  }

  async decrementReposts(
    postId:string,
  ){

    const key =
      `post:${postId}:reposts`;

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

  async getRepostsCount(
    postId:string,
  ){

    const count =
      await this.redis.get(

        `post:${postId}:reposts`,
      );

    return Number(
      count || 0,
    );
  }
}