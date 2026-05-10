import {  Injectable,} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisPostGuardService {

  private readonly redis =
    new Redis({
      host: 'localhost',
      port: 6379,
    });

  
  // RATE LIMIT
  

  async checkPostRateLimit(userId: string,  ) {
    const key =`post_rate:${userId}`;
    const total = await this.redis.incr(key);
    // first request
    if (total === 1) {
      await this.redis.expire(
        key,
        60,
      );
    }
    return total <= 5;
  }



  
  // DUPLICATE CONTENT
  async checkDuplicatePost(userId: string,content: string,) {
    const normalized =content.trim().toLowerCase();
    const key = `post_duplicate:${userId}:${normalized}`;
    const exists = await this.redis.exists(key);
    if (exists) {
      return false;
    }
    await this.redis.set(
      key,
      '1',
      'EX',
      60,
    );
    return true;
  }
}