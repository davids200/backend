import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis.service';

@Injectable()
export class RedisCounterService {
  constructor(private readonly redis: RedisService) {}

  // =========================
  // KEY BUILDERS
  // =========================
  private likeKey(type: string, id: string) {
    return `likes:${type}:${id}`;
  }

  private commentKey(postId: string) {
    return `comments:post:${postId}`;
  }

  // =========================
  // LIKE COUNTERS
  // =========================
  async incrementLikes(type: string, id: string) {
    await this.redis.getClient().incr(this.likeKey(type, id));
  }

  async decrementLikes(type: string, id: string) {
    await this.redis.getClient().decr(this.likeKey(type, id));
  }

  // =========================
  // COMMENT COUNTERS (POST LEVEL)
  // =========================
  async incrementComments(postId: string) {
    await this.redis.getClient().incr(this.commentKey(postId));
  }

  async decrementComments(postId: string) {
    await this.redis.getClient().decr(this.commentKey(postId));
  }

  // =========================
  // GETTERS
  // =========================
  async getLikes(type: string, id: string): Promise<number> {
    const val = await this.redis.getClient().get(this.likeKey(type, id));
    return val ? parseInt(val, 10) : 0;
  }

  async getComments(postId: string): Promise<number> {
    const val = await this.redis.getClient().get(this.commentKey(postId));
    return val ? parseInt(val, 10) : 0;
  }

  // =========================
  // BULK FETCH (🔥 CRITICAL)
  // =========================
  async getBulkCounts(postIds: string[]) {
    const pipeline = this.redis.getClient().pipeline();

    postIds.forEach((postId) => {
      pipeline.get(this.likeKey('post', postId));
      pipeline.get(this.commentKey(postId));
    });

    const results = await pipeline.exec();

    const map: Record<
      string,
      { likes: number; comments: number }
    > = {};

    postIds.forEach((postId, i) => {
      const likeVal = results?.[i * 2]?.[1];
      const commentVal = results?.[i * 2 + 1]?.[1];

      map[postId] = {
        likes: likeVal ? parseInt(likeVal as string, 10) : 0,
        comments: commentVal ? parseInt(commentVal as string, 10) : 0,
      };
    });

    return map;
  }
}