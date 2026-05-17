import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';

import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';
import { RedisEngagementCounterService } from '../../infrastructure/redis/counters/engagement/redis.engagement.counter.service';

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

    private readonly engagement:
      RedisEngagementCounterService,
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
    // LOAD AGGREGATED ENGAGEMENT
    // =================================================

    const engagement =
      await this.engagement
        .getEngagement(
          postId,
        );

    // =================================================
    // EMIT AGGREGATED STATE
    // =================================================

    await this.kafka.emit(

      KAFKA_TOPICS
        .ENGAGEMENT_UPDATED,

      {

        postId,

        likes:
          engagement.likes,

        comments:
          engagement.comments,

        views:
          engagement.views,

        bookmarks:
          engagement.bookmarks,

        reposts:
          engagement.reposts,

        dwellTimeMs:
          engagement.dwellTimeMs,

        completionRate:0,

        createdAt:
          event.createdAt ||

          new Date()
            .toISOString(),

        authorId:
          event.actorId,
      },
    );

    // =================================================
    // LOGS
    // =================================================

    this.logger.log(

      `📊 Engagement aggregated: ${postId}`,
    );

    console.log({

      postId,

      ...engagement,
    });
  }
}