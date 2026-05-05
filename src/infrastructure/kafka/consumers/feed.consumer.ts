import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';

import { RedisService } from '../../redis/redis.service';
import { RedisFeedService } from '../../redis/feed/redis.feed.service';

import { calculateScore } from '../../../modules/feed/utils/feed-ranking.util';
import { CELEBRITY_THRESHOLD } from '../../../modules/feed/feed.constants';

import { LocationFeedRepository } from '../../scylladb/location.feed.repo';
import { KAFKA_CONSTANTS } from '../kafka.constants';

type Visibility = 'LOCAL' | 'DISTRICT' | 'COUNTRY' | 'GLOBAL';

@Injectable()
export class FeedConsumer implements OnModuleInit {
  private readonly logger = new Logger(FeedConsumer.name);

  private kafka = new Kafka({
    clientId: 'social-app',
    brokers: ['localhost:9092'],
  });

  private consumer = this.kafka.consumer({
    groupId: 'feed-fanout-group',
  });

  constructor(
    private readonly redis: RedisService,
    private readonly redisFeed: RedisFeedService,
    private readonly locationFeedRepo: LocationFeedRepository,
  ) {}

  async onModuleInit() {
    await this.start();
  }

  private async start() {
    await this.consumer.connect();

    await this.consumer.subscribe({
      topic: 'post.created',
      fromBeginning: false,
    });

    this.logger.log('🚀 Feed Consumer started');

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        try {
          const event = JSON.parse(message.value.toString());

          const {
            postId,
            userId,
            createdAt,
            locationId,
            districtId,
            countryCode,
            visibility = 'LOCAL',
          }: {
            postId: string;
            userId: string;
            createdAt: string;
            locationId?: string;
            districtId?: string;
            countryCode?: string;
            visibility: Visibility;
          } = event;

          this.logger.log(`📩 post.created: ${postId}`);

          // =========================
          // 0. WRITE TO SCYLLA (BASED ON VISIBILITY)
          // =========================
          await this.locationFeedRepo.insertPost({
            locationId: locationId!,
            districtId,
            countryCode,
            postId,
            authorId: userId,
            createdAt: new Date(createdAt),
            visibility,
          });

          // =========================
          // 1. GET FOLLOWERS (REDIS)
          // =========================
          const followerList = await this.redis
            .getClient()
            .smembers(`followers:${userId}`);

          const followerCount = followerList.length;

          // =========================
          // 2. CELEBRITY LOGIC
          // =========================
          if (followerCount > CELEBRITY_THRESHOLD) {
            this.logger.log(
              `🔥 Celebrity (${followerCount}) → skip fanout (pull from Scylla)`,
            );
            return;
          }

          if (!followerCount) return;

          // =========================
          // 3. SCORE CALCULATION
          // =========================
          const score = calculateScore({
            createdAt,
            likes: 0,
            comments: 0,
            isFollowingAuthor: true,
          });

          // =========================
          // 4. FANOUT (BATCHED)
          // =========================
          

          for (let i = 0; i < followerCount; i += KAFKA_CONSTANTS.BATCH_SIZE) {
            const batch = followerList.slice(i, i + KAFKA_CONSTANTS.BATCH_SIZE);

            await Promise.all(
              batch.map((followerId) =>
                this.redisFeed.addToFeed(
                  followerId,
                  postId,
                  score,
                ),
              ),
            );
          }

          // =========================
          // 5. TRIM FEEDS
          // =========================
          for (let i = 0; i < followerCount; i += KAFKA_CONSTANTS.BATCH_SIZE) {
            const batch = followerList.slice(i, i + KAFKA_CONSTANTS.BATCH_SIZE);

            await Promise.all(
              batch.map((followerId) =>
                this.redisFeed.trimFeed(followerId),
              ),
            );
          }

          this.logger.log(
            `⚡ Fanout complete → ${followerCount} users`,
          );
        } catch (err) {
          this.logger.error('Feed consumer error', err);
        }
      },
    });
  }
}