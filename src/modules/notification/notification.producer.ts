import { Injectable } from '@nestjs/common';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';
 
export interface NotificationEvent {
  userId: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SYSTEM';
  referenceId: string;
  actorId?: string;
  createdAt?: string;
}

@Injectable()
export class NotificationProducer {
  constructor(private readonly kafka: KafkaService) {}

  // =========================
  // GENERIC NOTIFICATION EVENT
  // =========================
  async sendNotification(event: NotificationEvent) {
    await this.kafka.emit(
      KAFKA_TOPICS.NOTIFICATION_SEND,
      event,
      event.userId, // key for partitioning
    );
  }
}