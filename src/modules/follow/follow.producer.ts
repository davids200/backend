import { Injectable } from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service'; 
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';

@Injectable()
export class FollowProducer {

  constructor(
    private readonly kafka:
      KafkaService,
  ) {}

  // =====================================================
  // FOLLOW CREATED
  // =====================================================

  async followCreated(data: {

    followerId: string;

    followingId: string;
  }) {

    await this.kafka.emit(

      KAFKA_TOPICS.FOLLOW_CREATED,

      data,

      data.followerId,
    );
  }

  // =====================================================
  // FOLLOW REMOVED
  // =====================================================

  async followRemoved(data: {

    followerId: string;

    followingId: string;
  }) {

    await this.kafka.emit(

      KAFKA_TOPICS.FOLLOW_REMOVED,

      data,

      data.followerId,
    );
  }
}