import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { HashtagRepository }
from './hashtag.repository';

import { RedisHashtagService }
from '../../infrastructure/redis/hashtag/redis.hashtag.service';

@Injectable()
export class HashtagService {
  private readonly logger =
    new Logger(HashtagService.name);

  constructor(
    private readonly repository: HashtagRepository,

    private readonly redisHashtag:
      RedisHashtagService,
  ) {}

  // =====================================================
  // PROCESS HASHTAGS
  // =====================================================

  async processHashtags(params: {
    postId: string;
    userId: string;
    hashtags: string[];
    locationId?: string;
    createdAt: Date;
  }) {

    const {
      postId,
      userId,
      hashtags,
      locationId,
      createdAt,
    } = params;

    try {

      // ===================================================
      // PROCESS EACH HASHTAG
      // ===================================================

      for (const hashtag of hashtags) {

        // ================================================
        // INITIAL TRENDING SCORE
        // ================================================

        const score = 10;

        // ================================================
        // SAVE HASHTAG RELATION
        // ================================================

        await this.repository
          .insertHashtagByPost({
            postId,
            hashtag,
          });

        // ================================================
        // SAVE POST INSIDE HASHTAG FEED
        // ================================================

        await this.repository
          .insertPostByHashtag({
            hashtag,
            score,
            createdAt,
            postId,
            authorId: userId,
          });

        // ================================================
        // GLOBAL HASHTAG TRENDING
        // ================================================

        await this.redisHashtag
          .incrementHashtagScore(
            hashtag,
            score,
          );

        // ================================================
        // LOCATION HASHTAG TRENDING
        // ================================================

        if (locationId) {

          await this.redisHashtag
            .incrementLocationHashtagScore(
              locationId,
              hashtag,
              score,
            );
        }
      }

      this.logger.log(
        `✅ Hashtags processed for post ${postId}`,
      );

    } catch (err) {

      this.logger.error(
        'Hashtag processing failed',
        err,
      );

      throw err;
    }
  }
}