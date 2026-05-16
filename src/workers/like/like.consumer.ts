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
export class LikeConsumer
implements OnModuleInit {

  private readonly logger =
    new Logger(
      LikeConsumer.name,
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

    await this.kafka.consume(

      'like-group',

      KAFKA_TOPICS
        .LIKE_CREATED,

      async (event:any) => {

        try {

          await this.handleLikeCreated(
            event,
          );

        } catch(error){

          this.logger.error(

            '❌ Like created failed',

            error,
          );
        }
      },
    );

    await this.kafka.consume(

      'like-groupp',

      KAFKA_TOPICS
        .LIKE_REMOVED,

      async (event:any) => {

        try {

          await this.handleLikeRemoved(
            event,
          );

        } catch(error){

          this.logger.error(

            '❌ Like removed failed',

            error,
          );
        }
      },
    );

    this.logger.log(
      '✅ LikeConsumer started',
    );
  }

  // =====================================================
  // LIKE CREATED
  // =====================================================

  private async handleLikeCreated(
    event:any,
  ){

    console.log(
      'LIKE EVENT',
      event,
    );

    const postId =
      event.targetId;

    if (!postId){

      this.logger.error(
        '❌ Missing targetId in like event',
      );

      return;
    }

    await this.counter.incrementLikes(
      postId,
    );

    await this.kafka.emit(

      KAFKA_TOPICS
        .ENGAGEMENT_SIGNAL,

      {

        postId,

        actorId:
          event.userId,

        type:'LIKE',

        createdAt:
          event.createdAt,
      },
    );

    await this.notification
      .sendNotification({

        userId:
          event.authorId,

        actorId:
          event.userId,

        type:'LIKE',

        referenceId:
          postId,

        createdAt:
          event.createdAt,
      });

    this.logger.log(

      `❤️ Like created: ${postId}`,
    );
  }

  // =====================================================
  // LIKE REMOVED
  // =====================================================

  private async handleLikeRemoved(
    event:any,
  ){

    const postId =
      event.targetId;

    if (!postId){

      this.logger.error(
        '❌ Missing targetId in unlike event',
      );

      return;
    }

    await this.counter.decrementLikes(
      postId,
    );

    await this.kafka.emit(

      KAFKA_TOPICS
        .ENGAGEMENT_SIGNAL,

      {

        postId,

        actorId:
          event.userId,

        type:'LIKE',

        createdAt:
          event.createdAt,
      },
    );

    this.logger.log(

      `💔 Like removed: ${postId}`,
    );
  }
}