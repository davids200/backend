import { Injectable } from '@nestjs/common';
import { KafkaService } from '../kafka.service';
import { KAFKA_TOPICS } from '../kafka.topics';

@Injectable()
export class PostProducer {
  constructor(private readonly kafka: KafkaService) {}

  async postCreated(data: {
    postId: string;
    userId: string;
    locationId?: string;
    createdAt: string;
  }) {
    return this.kafka.emit(
      KAFKA_TOPICS.POST_CREATED,
      data,
      data.postId, // 🔥 key = postId
    );
  }
}