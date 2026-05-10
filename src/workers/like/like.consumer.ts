import {
  Injectable,
  Logger,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { RedisCounterService }
from '../../infrastructure/redis/counters/redis.counter.service';

import { NotificationProducer }
from '../../modules/notification/notification.producer';

import { LikeEntity }
from '../../modules/like/like.entity';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

// =====================================================
// EVENT TYPES
// =====================================================

type LikeCreatedEvent = {
  userId: string;
  targetId: string;
  targetType: 'post' | 'comment';
  authorId?: string;
};

type LikeRemovedEvent = {
  userId: string;
  targetId: string;
  targetType: 'post' | 'comment';
};

@Injectable()
export class LikeConsumer {

  private readonly logger =
    new Logger(LikeConsumer.name);

  constructor(

    // =====================================================
    // REPOSITORY
    // =====================================================

    @InjectRepository(LikeEntity)
    private readonly repo:
      Repository<LikeEntity>,

    // =====================================================
    // SERVICES
    // =====================================================

    private readonly kafka:
      KafkaService,

    private readonly redisCounter:
      RedisCounterService,

    private readonly notification:
      NotificationProducer,
  ) {}

  // =====================================================
  // START CONSUMER
  // =====================================================

  async start() {

    this.logger.log(
      '🚀 Starting LikeConsumer...',
    );

    // ================================================
    // LIKE CREATED
    // ================================================

    await this.kafka.consume<LikeCreatedEvent>(

      'like-group',

      KAFKA_TOPICS.LIKE_CREATED,

      async (event) => {

        try {

          await this.handleLikeCreated(
            event,
          );

        } catch (err) {

          this.logger.error(
            '❌ Like created error',
            err,
          );
        }
      },
    );

    // ================================================
    // LIKE REMOVED
    // ================================================

    await this.kafka.consume<LikeRemovedEvent>(

      'like-group',

      KAFKA_TOPICS.LIKE_REMOVED,

      async (event) => {

        try {

          await this.handleLikeRemoved(
            event,
          );

        } catch (err) {

          this.logger.error(
            '❌ Like removed error',
            err,
          );
        }
      },
    );

    this.logger.log(
      '✅ LikeConsumer started',
    );
  }

  // =====================================================
  // HANDLE LIKE CREATED
  // =====================================================

  private async handleLikeCreated(
    event: LikeCreatedEvent,
  ) {

    const {
      userId,
      targetId,
      targetType,
      authorId,
    } = event;

    // ================================================
    // CHECK EXISTING LIKE
    // ================================================

    const existing =
      await this.repo.findOne({

        where: {
          userId,
          targetId,
          targetType,
        },
      });

    if (existing) {
      return;
    }

    // ================================================
    // SAVE LIKE
    // ================================================

    const like =
      this.repo.create({

        userId,
        targetId,
        targetType,
      });

    await this.repo.save(
      like,
    );

    // ================================================
    // UPDATE REDIS COUNTERS
    // ================================================

    await this.redisCounter
      .incrementLikes(

        targetType,

        targetId,
      );

    // ================================================
    // CREATE NOTIFICATION
    // ================================================

    if (
      authorId &&
      authorId !== userId
    ) {

      await this.notification
        .sendNotification({

          userId:
            authorId,

          actorId:
            userId,

          type:
            `${targetType}_like`,

          referenceId:
            targetId,

          createdAt:
            new Date().toISOString(),
        });
    }

    this.logger.log(
      `❤️ Like created: ${targetId}`,
    );
  }

  // =====================================================
  // HANDLE LIKE REMOVED
  // =====================================================

  private async handleLikeRemoved(
    event: LikeRemovedEvent,
  ) {

    const {
      userId,
      targetId,
      targetType,
    } = event;

    // ================================================
    // DELETE LIKE
    // ================================================

    await this.repo.delete({

      userId,
      targetId,
      targetType,
    });

    // ================================================
    // UPDATE REDIS COUNTERS
    // ================================================

    await this.redisCounter
      .decrementLikes(

        targetType,

        targetId,
      );

    this.logger.log(
      `💔 Like removed: ${targetId}`,
    );
  }
}