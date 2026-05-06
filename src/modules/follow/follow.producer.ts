import { Injectable } from '@nestjs/common'; 
import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';
@Injectable()
export class FollowProducer {
  constructor(private readonly kafka: KafkaService) {}

  async followCreated(data: {
    followerId: string;
    followingId: string;
  }) {
    return this.kafka.emit(
      KAFKA_TOPICS.FOLLOW_CREATED,
      data,
      data.followerId, // 🔥 key = follower
    );
  }

  async followRemoved(data: {
    followerId: string;
    followingId: string;
  }) {
    return this.kafka.emit(
      KAFKA_TOPICS.FOLLOW_REMOVED,
      data,
      data.followerId,
    );
  }
}