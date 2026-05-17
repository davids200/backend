import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';
 

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';
import { RedisViewCounterService } from '../../infrastructure/redis/counters/view/redis.view.counter.service';

@Injectable()
export class ViewConsumer
implements OnModuleInit {

  private readonly logger =
    new Logger(
      ViewConsumer.name,
    );

  constructor(

    private readonly kafka:
      KafkaService,

    private readonly counter:RedisViewCounterService,
  ) {}

  async onModuleInit(){

    await this.start();
  }

  async start(){

    await this.kafka.consume(

      'view-created-group',

      KAFKA_TOPICS
        .VIEW_CREATED,

      async (event:any) => {

        try {

          await this.handleViewCreated(
            event,
          );

        } catch(error){

          this.logger.error(

            '❌ View processing failed',

            error,
          );
        }
      },
    );

    this.logger.log(
      '✅ ViewConsumer started',
    );
  }

  // =====================================================
  // VIEW CREATED
  // =====================================================

  private async handleViewCreated(event:any,  ){
    console.log('VIEW EVENT',event,);
    const postId = event.postId;

    if (!postId){
      this.logger.error( '❌ Missing postId',   );

      return;
    }

    // =================================================
    // VIEW COUNT
    // =================================================

    await this.counter.incrementViews(
      postId,
    );

    // =================================================
    // DWELL TIME
    // =================================================

    if (event.dwellTimeMs){

      await this.counter.addDwellTime(

        postId,

        event.dwellTimeMs,
      );
    }

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

        type:'VIEW',

        createdAt:
          event.createdAt,
      },
    );

    this.logger.log(

      `👁️ View created: ${postId}`,
    );
  }
}