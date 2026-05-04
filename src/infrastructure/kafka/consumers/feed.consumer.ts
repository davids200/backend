import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';

import { RedisService } from '../../redis/redis.service';
import { RedisFeedService } from '../../redis/feed/redis.feed.service';

import { calculateScore } from '../../../modules/feed/utils/feed-ranking.util'; 
import { CELEBRITY_THRESHOLD } from '../../../modules/feed/feed.constants';

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
          const { postId, userId, createdAt } = event;

          this.logger.log(`📩 post.created: ${postId}`);

          // =========================
          // 1. GET FOLLOWERS FROM REDIS
          // =========================
          const followerList = await this.redis
            .getClient()
            .smembers(`followers:${userId}`);

          if (!followerList.length) return;

          // =========================
          // 2. CELEBRITY CHECK
          // =========================
          const followerCount = followerList.length;

          if (followerCount > CELEBRITY_THRESHOLD) {
            this.logger.log(
              `🔥 Celebrity (${followerCount}) → skip fanout`,
            );
            return;
          }

          // =========================
          // 3. CALCULATE SCORE
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
          const BATCH_SIZE = 500;

          for (let i = 0; i < followerList.length; i += BATCH_SIZE) {
            const batch = followerList.slice(i, i + BATCH_SIZE);

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
          // 5. TRIM FEEDS (KEEP LAST N)
          // =========================
          for (let i = 0; i < followerList.length; i += BATCH_SIZE) {
            const batch = followerList.slice(i, i + BATCH_SIZE);

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