import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { RedisService }
from '../../infrastructure/redis/redis.service';

import { RedisFeedService }
from '../../infrastructure/redis/feed/redis.feed.service';

import { LocationFeedRepository }
from '../../infrastructure/scylladb/location.feed.repo';

import { LocationService }
from '../../modules/location/location.service';

import { calculateScore }
from '../../modules/feed/utils/feed-ranking.util';

import { CELEBRITY_THRESHOLD }
from '../../modules/feed/feed.constants';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

interface FeedFanoutEvent {

  postId: string;

  authorId: string;

  visibility:
    | 'public'
    | 'followers'
    | 'private'
    | 'local';

  createdAt: string;

  locationId?: string;
}

@Injectable()
export class FeedConsumer
  implements OnModuleInit
{
  private readonly logger =
    new Logger(
      FeedConsumer.name,
    );

  constructor(

    private readonly kafka:
      KafkaService,

    private readonly redis:
      RedisService,

    private readonly redisFeed:
      RedisFeedService,

    private readonly locationFeedRepo:
      LocationFeedRepository,

    private readonly locationService:
      LocationService,
  ) {

    this.logger.log(
      '✅ FeedConsumer initialized',
    );
  }

  // =====================================================
  // MODULE INIT
  // =====================================================

  async onModuleInit() {

    await this.start();
  }

  // =====================================================
  // START CONSUMER
  // =====================================================

  async start() {

    this.logger.log(
      '🚀 Starting FeedConsumer...',
    );

    await this.kafka.consume<FeedFanoutEvent>(

      'feed-group',

      KAFKA_TOPICS.FEED_FANOUT,

      async (event) => {

        try {

          this.logger.log(

            `📩 Feed event: ${event.postId}`,
          );

          await this.handleFeedFanout(
            event,
          );

        } catch (err) {

          this.logger.error(
            '❌ FeedConsumer failed',
            err,
          );
        }
      },
    );

    this.logger.log(
      '✅ FeedConsumer running',
    );
  }

  // =====================================================
  // HANDLE FEED FANOUT
  // =====================================================

  private async handleFeedFanout(
    event: FeedFanoutEvent,
  ) {

    const {
      postId,
      authorId,
      createdAt,
      locationId,
    } = event;

    // ================================================
    // GET FOLLOWERS
    // ================================================

    const followerList =
      await this.redis
        .client
        .smembers(
          `followers:${authorId}`,
        );

    const followerCount =
      followerList.length;

    this.logger.log(

      `👥 Followers: ${followerCount}`,
    );

    // ================================================
    // CELEBRITY CHECK
    // ================================================

    if (
      followerCount >
      CELEBRITY_THRESHOLD
    ) {

      this.logger.warn(

        `🔥 Celebrity detected (${followerCount})`,
      );

      return;
    }

    // ================================================
    // CALCULATE SCORE
    // ================================================

    const score =
  calculateScore({

    createdAt:
      new Date(createdAt),

    likes: 0,

    comments: 0,

    isFollowingAuthor: true,
  });

    // ================================================
    // REDIS FANOUT
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

        batch.map(

          async (
            followerId,
          ) => {

            await this.redisFeed
              .addToFeed(

                followerId,

                postId,

                score,
              );
          },
        ),
      );
    }

    this.logger.log(

      `📰 Redis fanout complete: ${postId}`,
    );

    // ================================================
    // LOCATION FEED (SCYLLA)
    // ================================================

    if (locationId) {

      const hierarchy =
        await this.locationService.getLocationHierarchy(
            locationId,
          );

      if (
        hierarchy?.length
      ) {

        await Promise.all(
          hierarchy.map(
            async (loc) => {
              await this.locationFeedRepo
                .insertPost({locationId:loc.id,postId,authorId,createdAt:new Date(createdAt,),
                });
              this.logger.log(`📍 Scylla insert → ${loc.id}`,
              );
            },
          ),
        );
      }
    }

    this.logger.log(`✅ Feed processed: ${postId}`,
    );
  }
}