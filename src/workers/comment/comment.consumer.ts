import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { RedisCounterService }
from '../../infrastructure/redis/counters/redis.counter.service';

import { NotificationProducer }
from '../../modules/notification/notification.producer';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

@Injectable()
export class CommentConsumer
implements OnModuleInit {

  private readonly logger =
    new Logger(
      CommentConsumer.name,
    );

  constructor(

    private readonly kafka:
      KafkaService,

    private readonly counter:
      RedisCounterService,

    private readonly notification:
      NotificationProducer,
  ) {}

  async onModuleInit(){

    await this.start();
  }

  // =====================================================
  // START
  // =====================================================

  async start(){

    // =================================================
    // COMMENT CREATED
    // =================================================

    await this.kafka.consume(

      'comment-created-group',

      KAFKA_TOPICS
        .COMMENT_CREATED,

      async (event:any) => {

        try {

          await this.handleCommentCreated(
            event,
          );

        } catch(error){

          this.logger.error(

            '❌ Comment create failed',

            error,
          );
        }
      },
    );

    // =================================================
    // COMMENT REMOVED
    // =================================================

    await this.kafka.consume(

      'comment-removed-group',

      KAFKA_TOPICS
        .COMMENT_REMOVED,

      async (event:any) => {

        try {

          await this.handleCommentRemoved(
            event,
          );

        } catch(error){

          this.logger.error(

            '❌ Comment remove failed',

            error,
          );
        }
      },
    );

    this.logger.log(
      '✅ CommentConsumer started',
    );
  }

  // =====================================================
  // COMMENT CREATED
  // =====================================================

  private async handleCommentCreated(
    event:any,
  ){

    console.log(
      'COMMENT CREATED EVENT',
      event,
    );

    // =================================================
    // VALIDATION
    // =================================================

    const postId =
      event.postId;

    if (!postId){

      this.logger.error(
        '❌ Missing targetId in comment.created',
      );

      return;
    }

    // =================================================
    // REDIS COUNTER
    // =================================================

    await this.counter.incrementComments(
      postId,
    );

    // =================================================
    // ENGAGEMENT SIGNAL
    // =================================================

    await this.kafka.emit(

      KAFKA_TOPICS
        .ENGAGEMENT_SIGNAL,

      {

        postId,

        actorId:
          event.userId,

        type:'COMMENT',

        createdAt:
          event.createdAt ||

          new Date()
            .toISOString(),
      },
    );

    // =================================================
    // NOTIFICATION
    // =================================================

    await this.notification
      .sendNotification({

        userId:
          event.authorId,

        actorId:
          event.userId,

        type:'COMMENT',

        referenceId:
          postId,

        createdAt:
          event.createdAt ||

          new Date()
            .toISOString(),
      });

    this.logger.log(

      `💬 Comment created: ${postId}`,
    );
  }

  // =====================================================
  // COMMENT REMOVED
  // =====================================================

  private async handleCommentRemoved(
    event:any,
  ){

    console.log(
      'COMMENT REMOVED EVENT',
      event,
    );

    // =================================================
    // VALIDATION
    // =================================================

    const postId =
      event.targetId;

    if (!postId){

      this.logger.error(
        '❌ Missing targetId in comment.removed',
      );

      return;
    }

    // =================================================
    // REDIS COUNTER
    // =================================================

    await this.counter.decrementComments(
      postId,
    );

    // =================================================
    // ENGAGEMENT SIGNAL
    // =================================================

    await this.kafka.emit(

      KAFKA_TOPICS
        .ENGAGEMENT_SIGNAL,

      {

        postId,

        actorId:
          event.userId,

        type:'COMMENT',

        createdAt:
          event.createdAt ||

          new Date()
            .toISOString(),
      },
    );

    this.logger.log(

      `🗑️ Comment removed: ${postId}`,
    );
  }
}