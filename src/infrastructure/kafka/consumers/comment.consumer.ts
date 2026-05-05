import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { RedisCounterService } from '../../redis/counters/redis.counter.service';
import { NotificationProducer } from '../producers/notification.producer';


@Injectable()
export class CommentConsumer implements OnModuleInit {
  private kafka = new Kafka({
    clientId: 'social-app',
    brokers: ['localhost:9092'],
  });

  private consumer = this.kafka.consumer({
    groupId: 'comment-group',
  });

  constructor(
    private readonly counter: RedisCounterService,
    private readonly notification: NotificationProducer,
  ) {}

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'comment.created',
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;

        const event = JSON.parse(message.value.toString());

        // =========================
        // 1. INCREMENT COUNTER
        // =========================
        await this.counter.incrementComments(event.postId);

        // =========================
        // 2. NOTIFICATION
        // =========================
       await this.notification.sendNotification({
  userId: event.userId,
  type: 'COMMENT',
  referenceId: event.postId,
  actorId: event.userId,
  createdAt: new Date().toISOString(),
});
      },
    });
  }
}