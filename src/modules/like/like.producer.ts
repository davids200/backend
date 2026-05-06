import { Injectable } from '@nestjs/common'; 
import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { LikeTargetType } from './like.entity';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';

@Injectable()
export class LikeProducer {
  constructor(private readonly kafka: KafkaService) {}

  async likeCreated(
    userId: string,
    targetId: string,
    targetType: LikeTargetType,
    authorId: string,
  ) {
    return this.kafka.emit(
      KAFKA_TOPICS.LIKE_CREATED,
      {
        userId,
        targetId,
        targetType,
        authorId,
        createdAt: new Date().toISOString(),
      },
      targetId, // 🔥 key = target
    );
  }

  async likeRemoved(
    userId: string,
    targetId: string,
    targetType: LikeTargetType,
  ) {
    return this.kafka.emit(
      KAFKA_TOPICS.LIKE_REMOVED,
      {
        userId,
        targetId,
        targetType,
      },
      targetId,
    );
  }
}