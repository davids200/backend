import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { LocationService } from '../../modules/location/location.service';
import { calculateScore } from '../../modules/feed/utils/feed-ranking.util';
import { CELEBRITY_THRESHOLD } from '../../modules/feed/feed.constants';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';

// ✅ Correct paths — matches what ScyllaModule exports
import { LocationFeedRepository } from '../../infrastructure/scylladb/repositories/feed/location.feed.repo';
import { HomeFeedRepository } from '../../infrastructure/scylladb/repositories/feed/home.feed.repo';
import { UserFeedRepository } from '../../infrastructure/scylladb/repositories/feed/user.feed.repo';

interface FeedFanoutEvent {
  postId: string;
  authorId: string;
  visibility: 'public' | 'followers' | 'private' | 'local';
  createdAt: string;
  locationId?: string;
}

@Injectable()
export class FeedConsumer implements OnModuleInit {
  private readonly logger = new Logger(FeedConsumer.name);

  constructor(
    private readonly kafka: KafkaService,
    private readonly redis: RedisService,
    private readonly locationFeedRepo: LocationFeedRepository,
    private readonly locationService: LocationService,
    private readonly homeFeedRepo: HomeFeedRepository,
    private readonly userFeedRepo: UserFeedRepository,
  ) {
console.log('✅ FeedConsumer initialized in Constructor');

  }

  // =====================================================
  // MODULE INIT
  // =====================================================

  async onModuleInit(): Promise<void> {
    this.logger.log('✅ FeedConsumer initialized');
    await this.start();
  }

  // =====================================================
  // START CONSUMER
  // =====================================================

  async start(): Promise<void> {
    this.logger.log('🚀 Starting FeedConsumer...');

    await this.kafka.consume<FeedFanoutEvent>(
      'feed-group',
      KAFKA_TOPICS.FEED_FANOUT,
      async (event) => {
        try {
          this.logger.log(`📩 Feed event received: ${event.postId}`);
          await this.handleFeedFanout(event);
        } catch (err) {
          this.logger.error(`❌ FeedConsumer error on postId=${event.postId}`, err);
        }
      },
    );

    this.logger.log('✅ FeedConsumer running');
  }

  // =====================================================
  // HANDLE FEED FANOUT
  // =====================================================

  private async handleFeedFanout(event: FeedFanoutEvent): Promise<void> {
    const { postId, authorId, createdAt, locationId } = event;
    const createdAtDate = new Date(createdAt);

    // ================================================
    // 1. USER FEED — always save regardless of follower count
    // ================================================
    try {
      this.logger.log(`💾 Saving to UserFeed: postId=${postId} authorId=${authorId}`);
      await this.userFeedRepo.insertPost({ authorId, postId, createdAt: createdAtDate });
      this.logger.log(`✅ UserFeed saved: postId=${postId}`);
    } catch (err) {
      this.logger.error(`❌ UserFeed insert failed: postId=${postId}`, err);
    }

    // ================================================
    // 2. GET FOLLOWERS
    // ================================================
    const followerList = await this.redis.client.smembers(`followers:${authorId}`);
    const followerCount = followerList.length;
    this.logger.log(`👥 Followers for ${authorId}: ${followerCount}`);

    // ================================================
    // 3. CELEBRITY CHECK — skip home feed fanout only
    // ================================================
    if (followerCount > CELEBRITY_THRESHOLD) {
      this.logger.warn(`🔥 Celebrity detected (${followerCount} followers) — skipping home feed fanout`);
      // Still continue to location feed below
    } else {

      // ================================================
      // 4. CALCULATE SCORE
      // ================================================
      const score = calculateScore({
        createdAt: createdAtDate,
        likes: 0,
        comments: 0,
        isFollowingAuthor: true,
      });

      // ================================================
      // 5. HOME FEED — batch insert for all followers
      // ================================================
      const BATCH_SIZE = 500;
      this.logger.log(`📰 Starting home feed fanout for ${followerCount} followers...`);

      for (let i = 0; i < followerList.length; i += BATCH_SIZE) {
        const batch = followerList.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (followerId) => {
            try {
              await this.homeFeedRepo.insertPost({
              userId: followerId,
              postId,
              authorId,
              score,
              createdAt: createdAtDate,
              });
            } catch (err) {
              this.logger.error(`❌ HomeFeed insert failed: followerId=${followerId} postId=${postId}`, err);
            }
          }),
        );

        this.logger.log(`📰 HomeFeed batch done: ${i + batch.length}/${followerCount}`);
      }

      this.logger.log(`✅ HomeFeed fanout complete: postId=${postId}`);
    }

    // ================================================
    // 6. LOCATION FEED — save to ScyllaDB hierarchy
    // ================================================
    if (locationId) {
      this.logger.log(`📍 Processing location feed: locationId=${locationId}`);

      try {
        const hierarchy = await this.locationService.getLocationHierarchy(locationId);
        this.logger.log(`📍 Location hierarchy resolved: ${JSON.stringify(hierarchy?.map(l => l.id))}`);

        if (hierarchy?.length) {
          await Promise.all(
            hierarchy.map(async (loc) => {
              try {
                await this.locationFeedRepo.insertPost({
                  locationId: loc.id,
                  postId,
                  authorId,
                  createdAt: createdAtDate,
                });
                this.logger.log(`✅ LocationFeed saved: locationId=${loc.id} postId=${postId}`);
              } catch (err) {
                this.logger.error(`❌ LocationFeed insert failed: locationId=${loc.id} postId=${postId}`, err);
              }
            }),
          );
        } else {
          this.logger.warn(`⚠️ No location hierarchy found for locationId=${locationId}`);
        }
      } catch (err) {
        this.logger.error(`❌ getLocationHierarchy failed: locationId=${locationId}`, err);
      }
    } else {
      this.logger.log(`⏭️ No locationId on event — skipping location feed`);
    }

    this.logger.log(`✅ Feed fully processed: postId=${postId}`);
  }
}