import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { RedisService }
from '../../infrastructure/redis/redis.service';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

type FollowCreatedEvent = {

  followerId: string;

  followingId: string;
};

type FollowRemovedEvent = {

  followerId: string;

  followingId: string;
};

@Injectable()
export class FollowConsumer {

  private readonly logger =
    new Logger(
      FollowConsumer.name,
    );

  constructor(

    private readonly kafka:
      KafkaService,

    private readonly redis:
      RedisService,
  ) {}

  // =====================================================
  // START CONSUMER
  // =====================================================

  async start() {

    this.logger.log(
      '🚀 Starting FollowConsumer...',
    );

    // ================================================
    // FOLLOW CREATED
    // ================================================

    await this.kafka.consume<FollowCreatedEvent>(

      'follow-group',

      KAFKA_TOPICS.FOLLOW_CREATED,

      async (event) => {

        try {

          await this.handleFollowCreated(
            event,
          );

        } catch (err) {

          this.logger.error(
            '❌ Follow created error',
            err,
          );
        }
      },
    );

    // ================================================
    // FOLLOW REMOVED
    // ================================================

    await this.kafka.consume<FollowRemovedEvent>(

      'follow-group',

      KAFKA_TOPICS.FOLLOW_REMOVED,

      async (event) => {

        try {

          await this.handleFollowRemoved(
            event,
          );

        } catch (err) {

          this.logger.error(
            '❌ Follow removed error',
            err,
          );
        }
      },
    );

    this.logger.log(
      '✅ FollowConsumer started',
    );
  }

  // =====================================================
  // HANDLE FOLLOW CREATED
  // =====================================================

  private async handleFollowCreated(
    event: FollowCreatedEvent,
  ) {

    await this.redis.client.sadd(`followers:${event.followingId}`,

        event.followerId,
      );

    this.logger.log(

      `➕ Follow created: ${event.followerId} → ${event.followingId}`,
    );
  }

  // =====================================================
  // HANDLE FOLLOW REMOVED
  // =====================================================

  private async handleFollowRemoved(
    event: FollowRemovedEvent,
  ) {

    await this.redis.client.srem(`followers:${event.followingId}`,

        event.followerId,
      );

    this.logger.log(

      `➖ Follow removed: ${event.followerId} → ${event.followingId}`,
    );
  }
}