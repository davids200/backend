// src/workers/like/like.consumer.ts

import {
  Injectable,
  Logger,OnModuleInit
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  KafkaService,
} from '../../infrastructure/kafka/kafka.service';

import {
  RedisCounterService,
} from '../../infrastructure/redis/counters/redis.counter.service';

import {
  NotificationProducer,
} from '../../modules/notification/notification.producer';

import {
  LikeEntity,
} from '../../modules/like/like.entity';

import {
  KAFKA_TOPICS,
} from '../../common/constants/kafka-topics.constants';
 

import {
  EngagementUpdatedEvent,
} from '../../events/ranking/engagement-updated.event';
import { LikeCreatedEvent } from '../../events/like/like-created.event';
import { LikeRemovedEvent } from '../../events/like/like-removed.event';
 

@Injectable()
export class LikeConsumer implements OnModuleInit{

  private readonly logger =
    new Logger(
      LikeConsumer.name,
    );

  constructor(

    @InjectRepository(LikeEntity)
    private readonly likeRepo:
      Repository<LikeEntity>,

    private readonly kafka:
      KafkaService,

    private readonly redisCounter:
      RedisCounterService,

    private readonly notification:
      NotificationProducer,
  ) {}


  async onModuleInit() {

  await this.start();
}

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

     'like-created-group',

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

      'like-removed-group',

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
  event:LikeCreatedEvent,
) {

  console.log(
    'HANDLE LIKE CREATED STARTED',
  );

  const {
    targetId,
    targetType,
    authorId,
    createdAt,
  } = event;

  // ================================================
  // REDIS INCREMENT
  // ================================================

  console.log(
    'BEFORE REDIS INCREMENT',
  );

  const incrementResult =
    await this.redisCounter.incrementLikes(

      targetType,

      targetId,
    );

  console.log(
    'REDIS INCREMENT RESULT',
    incrementResult,
  );

  // ================================================
  // READ UPDATED COUNT
  // ================================================

  const likes =
    await this.redisCounter.getLikesCount(

      targetType,

      targetId,
    );

  console.log(
    'UPDATED LIKES COUNT',
    likes,
  );

  // ================================================
  // ENGAGEMENT EVENT
  // ================================================

  const rankingEvent:
    EngagementUpdatedEvent = {

      postId:
        targetId,

      likes,

      comments:0,

      reposts:0,

      createdAt,

      authorId,
    };

  console.log(
    'EMITTING ENGAGEMENT EVENT',
    rankingEvent,
  );

  await this.kafka.emit(

    KAFKA_TOPICS
      .ENGAGEMENT_UPDATED,

    rankingEvent,
  );

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

  await this.likeRepo.delete({

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

  // ================================================
  // GET UPDATED LIKE COUNT
  // ================================================

  const likes =
    await this.redisCounter
      .getLikesCount(

        targetType,

        targetId,
      );

  // ================================================
  // EMIT ENGAGEMENT UPDATE
  // ================================================

  const rankingEvent:
    EngagementUpdatedEvent = {

      postId:
        targetId,

      likes,

      comments: 0,

      reposts: 0,

      createdAt:
        new Date()
          .toISOString(),

      authorId:'',
    };

  await this.kafka.emit(

    KAFKA_TOPICS
      .ENGAGEMENT_UPDATED,

    rankingEvent,
  );

  this.logger.log(
    `💔 Like removed: ${targetId}`,
  );
}
}