import { Injectable } from '@nestjs/common';
import { KafkaService } from '../kafka.service';
import { KAFKA_TOPICS } from '../kafka.topics';

@Injectable()
export class NotificationProducer {
  constructor(private readonly kafka: KafkaService) {}

  async createNotification(data: {
    userId: string;
    actorId: string;
    type: string;
    targetId: string;
  }) {
    return this.kafka.emit(
      KAFKA_TOPICS.NOTIFICATION_SEND,
      data,
      data.userId, // 🔥 key = receiver
    );
  }
}