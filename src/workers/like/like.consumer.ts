import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; 
import { LikeEntity } from '../../modules/like/like.entity';
import { RedisCounterService } from '../../infrastructure/redis/counters/redis.counter.service';
import { RedisPubSubService } from '../../modules/notification/pubsub/redis.pubsub.service';

@Injectable()
export class LikeConsumer implements OnModuleInit {
  private readonly logger = new Logger(LikeConsumer.name);

  private kafka = new Kafka({
    clientId: 'social-app',
    brokers: ['localhost:9092'],
  });

  private consumer = this.kafka.consumer({
    groupId: 'like-group',
  });

  constructor(
    @InjectRepository(LikeEntity)
    private readonly repo: Repository<LikeEntity>,
    private readonly redisCounter: RedisCounterService,
    private readonly pubsub: RedisPubSubService,
  ) {}

  async onModuleInit() {
    await this.start();
  }

  private async start() {
    await this.consumer.connect();

    await this.consumer.subscribe({ topic: 'like.created' });
    await this.consumer.subscribe({ topic: 'like.removed' });

    this.logger.log('🚀 Like Consumer started');

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;

        try {
          const event = JSON.parse(message.value.toString());

          const { userId, targetId, targetType, authorId } = event;

          // =========================
          // LIKE CREATED
          // =========================
          if (topic === 'like.created') {
            await this.repo.save({
              userId,
              targetId,
              targetType,
            });

            await this.redisCounter.incrementLikes(
              targetType,
              targetId,
            );

            // 🔔 Notification (post_like / comment_like)
            await this.pubsub.publish('notification.created', {
              userId: authorId,
              actorId: userId,
              type: `${targetType}_like`,
              targetId,
            });
          }

          // =========================
          // LIKE REMOVED
          // =========================
          if (topic === 'like.removed') {
            await this.repo.delete({
              userId,
              targetId,
              targetType,
            });

            await this.redisCounter.decrementLikes(
              targetType,
              targetId,
            );
          }
        } catch (err) {
          this.logger.error('Like consumer error', err);
        }
      },
    });
  }
}