import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { RedisCounterService }
from '../../infrastructure/redis/counters/redis.counter.service';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

@Injectable()
export class RepostConsumer
implements OnModuleInit {

  private readonly logger =
    new Logger(
      RepostConsumer.name,
    );

  constructor(

    private readonly kafka:
      KafkaService,

    private readonly counter:
      RedisCounterService,
  ) {}

  async onModuleInit(){

    await this.start();
  }

  async start(){

    // ================================================
    // REPOST CREATED
    // ================================================

    await this.kafka.consume(

      'repost-created-group',

      KAFKA_TOPICS
        .REPOST_CREATED,

      async (event:any) => {

        try {

          await this.handleRepostCreated(
            event,
          );

        } catch(error){

          this.logger.error(

            '❌ Repost create failed',

            error,
          );
        }
      },
    );

    // ================================================
    // REPOST REMOVED
    // ================================================

    await this.kafka.consume(

      'repost-removed-group',

      KAFKA_TOPICS
        .REPOST_REMOVED,

      async (event:any) => {

        try {

          await this.handleRepostRemoved(
            event,
          );

        } catch(error){

          this.logger.error(

            '❌ Repost remove failed',

            error,
          );
        }
      },
    );

    this.logger.log(
      '✅ RepostConsumer started',
    );
  }

  // ================================================
  // CREATED
  // ================================================

  private async handleRepostCreated(
    event:any,
  ){

    console.log(
      'REPOST CREATED EVENT',
      event,
    );

    const postId =
      event.postId;

    if (!postId){

      this.logger.error(
        '❌ Missing postId',
      );

      return;
    }

    await this.counter.incrementReposts(postId,);

    await this.kafka.emit(KAFKA_TOPICS.ENGAGEMENT_SIGNAL,

      {
        postId,
        actorId:event.userId,
        type:'REPOST',
        createdAt:event.createdAt,
      },
    );
    this.logger.log(`🔁 Repost created: ${postId}`,
    );
  }

  // ================================================
  // REMOVED
  // ================================================

  private async handleRepostRemoved(
    event:any,
  ){

    console.log(
      'REPOST REMOVED EVENT',
      event,
    );

    const postId =
      event.postId;

    if (!postId){

      this.logger.error(
        '❌ Missing postId',
      );

      return;
    }

    await this.counter
      .decrementReposts(
        postId,
      );

    await this.kafka.emit(

      KAFKA_TOPICS
        .ENGAGEMENT_SIGNAL,

      {

        postId,

        actorId:
          event.userId,

        type:'REPOST',

        createdAt:
          event.createdAt,
      },
    );

    this.logger.log(

      `🗑️ Repost removed: ${postId}`,
    );
  }
}