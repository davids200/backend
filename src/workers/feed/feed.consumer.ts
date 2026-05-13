import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { RedisService }
from '../../infrastructure/redis/redis.service';

import { LocationService }
from '../../modules/location/location.service';

import { calculateScore }
from '../../modules/feed/constants/utils/feed-ranking.util';

import { FEED_CONSTANTS }
from '../../modules/feed/constants/feed.constants';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

import { LocationFeedRepository }
from '../../infrastructure/scylladb/repositories/feed/location.feed.repo';

import { HomeFeedRepository }
from '../../infrastructure/scylladb/repositories/feed/home.feed.repo';

import { UserFeedRepository }
from '../../infrastructure/scylladb/repositories/feed/user.feed.repo';

import { PostVisibility }
from '../../modules/post/enums/post-visibility.enum';

import { FeedFanoutEvent }
from '../../common/constants/contracts/events/feed-fanout.event'; 
import { FeedItemType } from '../../modules/feed/types/feed-item.type';

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

    private readonly locationFeedRepo:
      LocationFeedRepository,

    private readonly locationService:
      LocationService,

    private readonly homeFeedRepo:
      HomeFeedRepository,

    private readonly userFeedRepo:
      UserFeedRepository,
  ) {}

  // =====================================================
  // MODULE INIT
  // =====================================================

  async onModuleInit(): Promise<void> {

    await this.start();
  }

  // =====================================================
  // START CONSUMER
  // =====================================================

  async start(): Promise<void> {

    await this.kafka.consume<FeedFanoutEvent>(

      'feed-group',

      KAFKA_TOPICS.FEED_FANOUT,

      async (event) => {

        try {

          await this.handleFeedFanout(
            event,
          );

        } catch (err) {

          this.logger.error(

            `❌ FeedConsumer error on postId=${event.postId}`,

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
  ): Promise<void> {

    const {

      postId,

      authorId,

      createdAt,

      visibility,

      locationId,
    } = event;

    const createdAtDate =
      new Date(createdAt);

    // ================================================
    // USER FEED
    // ================================================

    try {

      await this.userFeedRepo
        .insertPost({

          authorId,

          postId,
          itemType:
  FeedItemType.POST,

          createdAt:
            createdAtDate,
        });

    } catch (err) {

      this.logger.error(

        `❌ UserFeed insert failed: postId=${postId}`,

        err,
      );
    }

    // ================================================
    // FOLLOWERS
    // ================================================

    const followerList =
      await this.redis.client
        .smembers(
          `followers:${authorId}`,
        );

    const followerCount =
      followerList.length;

    this.logger.log(
      `👥 FOLLOWER COUNT ${followerCount}`,
    );

    // ================================================
    // CELEBRITY CHECK
    // ================================================

    if (

      followerCount >
      FEED_CONSTANTS
        .CELEBRITY_THRESHOLD
    ) {

      this.logger.warn(

        `🔥 Celebrity detected (${followerCount} followers) — skipping home feed fanout`,
      );

    } else {

      // ================================================
      // SCORE
      // ================================================

      const score =
        calculateScore({

          createdAt:
            createdAtDate,

          likes: 0,

          comments: 0,

          isFollowingAuthor:
            true,
        });

      // ================================================
      // HOME FEED VISIBILITY
      // ================================================

      if (

        visibility ===
          PostVisibility.PUBLIC ||

        visibility ===
          PostVisibility.FOLLOWERS ||

        visibility ===
          PostVisibility.LOCAL
      ) {

        this.logger.log(

          `📰 Starting home feed fanout for ${followerCount} followers...`,
        );

        // ================================================
        // BATCH FANOUT
        // ================================================

        for (

          let i = 0;

          i < followerList.length;

          i +=
            FEED_CONSTANTS
              .BATCH_SIZE
        ) {

          const batch =
            followerList.slice(

              i,

              i +
                FEED_CONSTANTS
                  .BATCH_SIZE,
            );

          await Promise.all(

            batch.map(

              async (
                followerId,
              ) => {

                try {

                  await this.homeFeedRepo
                    .insertPost({

                      userId:
                        String(
                          followerId,
                        ),

                      postId,

                      authorId,
                      itemType:
  FeedItemType.POST,

                      score,

                      createdAt:
                        createdAtDate,
                    });

                } catch (err) {

                  this.logger.error(

                    `❌ HomeFeed insert failed: followerId=${followerId} postId=${postId}`,

                    err,
                  );
                }
              },
            ),
          );
        }

        this.logger.log(

          `✅ HomeFeed fanout complete: postId=${postId}`,
        );
      }
    }

    // ================================================
    // LOCATION FEED
    // ================================================

    if (

      locationId &&

      (

        visibility ===
          PostVisibility.PUBLIC ||

        visibility ===
          PostVisibility.LOCAL
      )
    ) {

      this.logger.log(

        `📍 Processing location feed: locationId=${locationId}`,
      );

      const hierarchy =
        await this.locationService
          .getLocationHierarchy(
            locationId,
          );

      this.logger.log(

        `📍 Location hierarchy resolved: ${JSON.stringify(hierarchy)}`,
      );

      if (hierarchy?.length) {

        await Promise.all(

          hierarchy.map(

            async (loc) => {

              try {

              await this.locationFeedRepo
  .insertPost({

    locationId:
      loc.id,

    postId,

    authorId,

    itemType:
      FeedItemType.POST,

    score:
      Date.now(),

    createdAt:
      createdAtDate,
  });

              } catch (err) {

                this.logger.error(

                  `❌ LocationFeed insert failed: locationId=${loc.id} postId=${postId}`,

                  err,
                );
              }
            },
          ),
        );
      }
    }

    // ================================================
    // COMPLETE
    // ================================================

    this.logger.log(

      `✅ Feed fully processed: postId=${postId}`,
    );
  }
}