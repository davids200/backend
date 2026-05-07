import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; 
import { NotificationEntity } from '../../modules/notification/notification.entity';
import { RedisPubSubService } from '../../modules/notification/pubsub/redis.pubsub.service';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';
@Injectable()
export class NotificationConsumer implements OnModuleInit {
  private readonly logger = new Logger(NotificationConsumer.name);

  private kafka = new Kafka({
    clientId: 'social-app',
    brokers: ['localhost:9092'],
  });

  private consumer = this.kafka.consumer({
    groupId: 'notification-group',
  });

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
    private readonly pubsub: RedisPubSubService,
  ) {}

  async onModuleInit() {
    await this.start();
  }

  private async start() {
    await this.consumer.connect();

    await this.consumer.subscribe({
      topic: KAFKA_TOPICS.NOTIFICATION_SEND,
    });

  //  this.logger.log('🚀 Notification Consumer started');

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        try {
          const event = JSON.parse(message.value.toString());

          const { userId, actorId, type, targetId } = event;

       
       
       
          // =========================
          // 1. SAVE TO DB
          // =========================
          const notification = await this.repo.save({
            userId,
            actorId,
            type,
            targetId,
          });

          

          // =========================
          // 2. REALTIME PUSH (REDIS PUB/SUB)
          // =========================
          await this.pubsub.publish(`user:${userId}`, notification);

        //  this.logger.log(`🔔 Notification for user ${userId}`);
        } catch (err) {
          this.logger.error('Notification error', err);
        }
      },
    });
  }
}