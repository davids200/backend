import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';

import { RedisService } from '../../redis/redis.service';
import { RedisFeedService } from '../../redis/feed/redis.feed.service';
import { LocationFeedRepository } from '../../scylladb/location.feed.repo';

import { calculateScore } from '../../../modules/feed/utils/feed-ranking.util';
import { CELEBRITY_THRESHOLD } from '../../../modules/feed/feed.constants';
import { LocationService } from '../../../modules/location/location.service';
import { LocationNode } from '../../../modules/location/location.types';

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
    private readonly locationService: LocationService,
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

          const { postId, userId, createdAt, locationId } = event;

          // 1. SCORE
          const score = calculateScore({
            createdAt,
            likes: 0,
            comments: 0,
            isFollowingAuthor: true,
          });

          // 2. FOLLOWERS
          const followers = await this.redis
            .getClient()
            .smembers(`followers:${userId}`);

          // 3. FANOUT (NON-CELEBRITY)
          if (followers.length <= CELEBRITY_THRESHOLD) {
            const BATCH = 500;

            for (let i = 0; i < followers.length; i += BATCH) {
              const batch = followers.slice(i, i + BATCH);

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
          }

          // 4. LOCATION FEED
          if (locationId) {
            const hierarchy: LocationNode[] =
              await this.locationService.getLocationHierarchy(
                locationId,
              );

            await Promise.all(
              hierarchy.map((loc) =>
                this.locationFeedRepo.insertPost({
                  locationId: loc.id,
                  postId,
                  authorId: userId,
                  createdAt: new Date(createdAt),
                }),
              ),
            );
          }

          // 5. GLOBAL
          await this.locationFeedRepo.insertGlobalPost({
            postId,
            authorId: userId,
            createdAt: new Date(createdAt),
          });

          this.logger.log(`✅ Feed processed: ${postId}`);
        } catch (err) {
          this.logger.error('Feed error', err);
        }
      },
    });
  }
}