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
export class ViewConsumer
implements OnModuleInit {

  private readonly logger =
    new Logger(
      ViewConsumer.name,
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

    await this.kafka.consume(

      'view-group',

      KAFKA_TOPICS
        .VIEW_CREATED,

      async (event:any) => {

        await this.handleView(
          event,
        );
      },
    );

    this.logger.log(
      '✅ ViewConsumer started',
    );
  }

  // ===================================================
  // HANDLE VIEW
  // ===================================================

  private async handleView(
    event:any,
  ){

    // ================================================
    // IGNORE LOW QUALITY VIEWS
    // ================================================

    if (
      event.dwellTimeMs < 3000
    ){
      return;
    }

    // ================================================
    // COUNTERS
    // ================================================

    await this.counter.incrementViews(
      event.targetId,
    );

    await this.counter.addDwellTime(

      event.targetId,

      event.dwellTimeMs,
    );

    // ================================================
    // ENGAGEMENT SIGNAL
    // ================================================

    await this.kafka.emit(

      KAFKA_TOPICS
        .ENGAGEMENT_SIGNAL,

      {

        postId:
          event.targetId,

        actorId:
          event.userId,

        type:'VIEW',

        createdAt:
          new Date()
            .toISOString(),
      },
    );

    this.logger.log(

      `👁️ View recorded: ${event.targetId}`,
    );
  }
}