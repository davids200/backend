import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { HashtagRepository }
from './hashtag.repository';

import { RedisHashtagService }
from '../../infrastructure/redis/hashtag/redis.hashtag.service';
import { HASHTAG_TOPIC_MAP } from '../../common/constants/hashtag-topic-map.constant';
 

@Injectable()
export class HashtagService {

  private readonly logger =
    new Logger(
      HashtagService.name,
    );

  constructor(

    private readonly repository:
      HashtagRepository,

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

    createdAt: Date;

    locationId?: string;
  }) {

    const {

      postId,

      userId,

      hashtags,

      createdAt,

      locationId,
    } = params;

    // ================================================
    // NORMALIZE + DEDUPLICATE
    // ================================================

    const normalizedHashtags =
      this.normalizeHashtags(
        hashtags,
      );

    // ================================================
    // PROCESS EACH HASHTAG
    // ================================================

    for (
      const hashtag
      of normalizedHashtags
    ) {

      try {

        // ============================================
        // INITIAL SCORE
        // ============================================

        const score = 10;

        // ============================================
        // SAVE POST ↔ HASHTAG RELATION
        // ============================================

        await this.repository
          .insertHashtagByPost({

            postId,

            hashtag,
          });

        // ============================================
        // INSERT INTO HASHTAG FEED
        // ============================================

        await this.repository
          .insertPostByHashtag({

            hashtag,

            score,

            createdAt,

            postId,

            authorId: userId,
          });

        // ============================================
        // GLOBAL TRENDING
        // ============================================

        await this.redisHashtag
          .incrementHashtagScore(

            hashtag,

            score,
          );

        // ============================================
        // LOCATION TRENDING
        // ============================================

        if (locationId) {

          await this.redisHashtag
            .incrementLocationHashtagScore(

              locationId,

              hashtag,

              score,
            );
        }

        // ============================================
        // OPTIONAL TOPIC MAPPING
        // ============================================

        const topic =
          HASHTAG_TOPIC_MAP[
            hashtag
          ];

        if (topic) {

          this.logger.debug(

            `#${hashtag} mapped to topic ${topic}`,
          );
        }

      } catch (err) {

        this.logger.error(

          `Failed processing hashtag: ${hashtag}`,

          err,
        );
      }
    }

    this.logger.log(

      `✅ Processed ${normalizedHashtags.length} hashtags for post ${postId}`,
    );
  }

  // =====================================================
  // NORMALIZE HASHTAGS
  // =====================================================

  private normalizeHashtags(
    hashtags: string[],
  ): string[] {

    const normalized =
      hashtags.map(

        (tag) =>

          tag
            .replace('#', '')
            .trim()
            .toLowerCase(),
      );

    return [
      ...new Set(normalized),
    ];
  }
}