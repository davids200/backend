import {
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  EventPattern,
  Payload,
} from '@nestjs/microservices';

import { PostgresService }
from '../../infrastructure/postgresql/postgres.service';

import { RedisFeedService }
from '../../infrastructure/redis/feed/redis.feed.service';

import { CELEBRITY_THRESHOLD }
from '../../modules/feed/feed.constants';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

@Injectable()
export class FeedWorker {
  private readonly logger =
    new Logger(FeedWorker.name);

  constructor(
    private readonly postgres:
      PostgresService,

    private readonly redisFeed:
      RedisFeedService,
  ) {}

  // =====================================================
  // POST CREATED EVENT
  // =====================================================

  @EventPattern(
    KAFKA_TOPICS.POST_CREATED,
  )
  async handlePostCreated(
    @Payload()
    payload: {
      postId: string;
      userId: string;
      createdAt: Date;
    },
  ) {

    const {
      postId,
      userId,
      createdAt,
    } = payload;

    try {

      // ================================================
      // GET FOLLOWERS
      // ================================================

      const followers =
        await this.postgres.query(
          `
          SELECT follower_id
          FROM follows
          WHERE following_id = $1
          `,
          [userId],
        );

      const followerCount =
        followers?.rowCount ?? 0;

      // ================================================
      // CELEBRITY DETECTION
      // ================================================

      const isCelebrity =
        followerCount >
        CELEBRITY_THRESHOLD;

      if (isCelebrity) {

        // this.logger.log(
        //   `🔥 Celebrity detected: ${userId}`,
        // );

        // ============================================
        // DO NOT FANOUT
        // ============================================

        return;
      }

      // ================================================
      // FOLLOWER LIST
      // ================================================

      const followerList =
        followers.rows;

      if (!followerList.length) {
        return;
      }

      // ================================================
      // SIMPLE SCORE
      // ================================================

      const score =
        new Date(createdAt)
          .getTime();

      // ================================================
      // PUSH TO REDIS FEEDS
      // ================================================

      const BATCH_SIZE = 500;

      for (
        let i = 0;
        i < followerList.length;
        i += BATCH_SIZE
      ) {

        const batch =
          followerList.slice(
            i,
            i + BATCH_SIZE,
          );

        await Promise.all(

          batch.map((follower) =>

            this.redisFeed.addToFeed(
              follower.follower_id,
              postId,
              score,
            ),
          ),
        );
      }

      // ================================================
      // TRIM FEEDS
      // ================================================

      await Promise.all(

        followerList.map((follower) =>

          this.redisFeed.trimFeed(
            follower.follower_id,
          ),
        ),
      );

      this.logger.log(
        `✅ Feed updated for ${followerList.length} users`,
      );

    } catch (err) {

      this.logger.error(
        'Feed Worker Error',
        err,
      );

      throw err;
    }
  }
}