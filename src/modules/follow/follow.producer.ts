import {
  Injectable,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

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

    createdAt: string;
  }) {

    await this.kafka.emit(

      'follow.created',

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

      'follow.removed',

      data,

      data.followerId,
    );
  }
}