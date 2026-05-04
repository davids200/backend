import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';

import { RedisFollowService } from '../../redis/follow/redis.follow.service';

@Injectable()
export class FollowConsumer implements OnModuleInit {
  private readonly logger = new Logger(FollowConsumer.name);

  private kafka = new Kafka({
    clientId: 'social-app',
    brokers: ['localhost:9092'],
  });

  private consumer = this.kafka.consumer({
    groupId: 'follow-group',
  });

  constructor(
    private readonly redisFollow: RedisFollowService,
  ) {}

  async onModuleInit() {
    await this.start();
  }

  private async start() {
    await this.consumer.connect();

    await this.consumer.subscribe({
      topic: 'follow.created',
      fromBeginning: false,
    });

    await this.consumer.subscribe({
      topic: 'follow.removed',
      fromBeginning: false,
    });

    this.logger.log('🚀 Follow Consumer started');

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;

        try {
          const event = JSON.parse(message.value.toString());

          const { followerId, followingId } = event;

          // =========================
          // FOLLOW
          // =========================
          if (topic === 'follow.created') {
            await this.redisFollow.follow(
              followerId,
              followingId,
            );
          }

          // =========================
          // UNFOLLOW
          // =========================
          if (topic === 'follow.removed') {
            await this.redisFollow.unfollow(
              followerId,
              followingId,
            );
          }

          this.logger.log(
            `👥 ${topic}: ${followerId} → ${followingId}`,
          );
        } catch (err) {
          this.logger.error('Follow consumer error', err);
        }
      },
    });
  }
}