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
export class EngagementConsumer
implements OnModuleInit {

  private readonly logger =
    new Logger(
      EngagementConsumer.name,
    );

  constructor(

    private readonly kafka:
      KafkaService,

    private readonly redis:
      RedisCounterService,
  ) {}

  async onModuleInit(){

    await this.start();
  }

  // =====================================================
  // START CONSUMER
  // =====================================================

  async start(){

    await this.kafka.consume(

      'engagement-group',

      KAFKA_TOPICS
        .ENGAGEMENT_SIGNAL,

      async (event:any) => {

        try {

          await this.handleSignal(
            event,
          );

        } catch(error){

          this.logger.error(

            '❌ Engagement aggregation failed',

            error,
          );
        }
      },
    );

    this.logger.log(
      '✅ EngagementConsumer started',
    );
  }

  // =====================================================
  // HANDLE SIGNAL
  // =====================================================

  private async handleSignal(
    event:any,
  ){

    // =================================================
    // VALIDATION
    // =================================================

    const postId =
      event.postId;

    if (!postId){

      this.logger.error(

        '❌ Missing postId in engagement signal',
      );

      return;
    }

    // =================================================
    // LOAD COUNTERS (PARALLEL)
    // =================================================

    const [

      likes,

      comments,

      views,

      bookmarks,

      reposts,

      dwellTimeMs,

    ] = await Promise.all([

      this.redis
        .getLikesCount(
          postId,
        ),

      this.redis
        .getCommentsCount(
          postId,
        ),

      this.redis
        .getViewsCount(
          postId,
        ),

      this.redis
        .getBookmarksCount(
          postId,
        ),

      this.redis
        .getRepostsCount(
          postId,
        ),

      this.redis
        .getDwellTime(
          postId,
        ),
    ]);

    // =================================================
    // EMIT AGGREGATED STATE
    // =================================================

    await this.kafka.emit(

      KAFKA_TOPICS
        .ENGAGEMENT_UPDATED,

      {

        postId,

        likes,

        comments,

        views,

        bookmarks,

        reposts,

        dwellTimeMs,

        completionRate:0,

        createdAt:
          event.createdAt ||

          new Date()
            .toISOString(),

        authorId:
          event.actorId,
      },
    );

    this.logger.log(

      `📊 Engagement aggregated: ${postId}`,
    );

    // =================================================
    // DEBUG
    // =================================================

    console.log({

      postId,

      likes,

      comments,

      views,

      bookmarks,

      reposts,

      dwellTimeMs,
    });
  }
}