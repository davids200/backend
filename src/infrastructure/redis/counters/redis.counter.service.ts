// src/infrastructure/redis/redis-counter.service.ts

import {
  Injectable,
} from '@nestjs/common';
import { RedisService } from '../redis.service';

 

@Injectable()
export class RedisCounterService {

  constructor(
    private readonly redis:RedisService,
  ) {}

  // =====================================================
  // KEY
  // =====================================================

  private getLikesKey(
    targetType:string,
    targetId:string,
  ) {

    return `${targetType}:${targetId}:likes`;
  }

  // =====================================================
  // INCREMENT
  // =====================================================

 async incrementLikes(
  targetType:string,
  targetId:string,
) {

  const key =
    this.getLikesKey(
      targetType,
      targetId,
    );

  console.log(
    'INCREMENTING KEY',
    key,
  );

  const result =
    await this.redis.client.incr(
      key,
    );

  console.log(
    'INCR RESULT',
    result,
  );

  return result;
}

  // =====================================================
  // DECREMENT
  // =====================================================

  async decrementLikes(
  targetType:string,
  targetId:string,
) {

  const key =
    this.getLikesKey(
      targetType,
      targetId,
    );

  const current =
    Number(
      await this.redis.client.get(
        key,
      ) || 0,
    );

  // ================================================
  // NEVER NEGATIVE
  // ================================================

  if (current <= 0) {

    await this.redis.client.set(
      key,
      0,
    );

    return 0;
  }

  return this.redis.client.decr(
    key,
  );
}

  // =====================================================
  // GET COUNT
  // =====================================================

  async getLikesCount(
    targetType:string,
    targetId:string,
  ) {

    const key =
      this.getLikesKey(
        targetType,
        targetId,
      );

    const count =
      await this.redis.client.get(
        key,
      );

    return Number(count || 0);
  }



// =====================================================
// COMMENT KEY
// =====================================================

private getCommentsKey(
  postId:string,
) {

  return `post:${postId}:comments`;
}

// =====================================================
// INCREMENT COMMENTS
// =====================================================

async incrementComments(
  postId:string,
) {

  return this.redis.client.incr(

    this.getCommentsKey(
      postId,
    ),
  );
}

// =====================================================
// DECREMENT COMMENTS
// =====================================================

async decrementComments(
  postId:string,
) {

  return this.redis.client.decr(

    this.getCommentsKey(
      postId,
    ),
  );
}

// =====================================================
// GET COMMENTS COUNT
// =====================================================

async getCommentsCount(
  postId:string,
) {

  const count =
    await this.redis.client.get(

      this.getCommentsKey(
        postId,
      ),
    );

  return Number(
    count || 0,
  );
}




}