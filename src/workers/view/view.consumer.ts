import { Injectable,Logger,OnModuleInit } from '@nestjs/common';

import { KafkaService } from '../../infrastructure/kafka/kafka.service';  
import { RedisCounterService } from '../../infrastructure/redis/counters/redis.counter.service';
import { ViewCreatedEvent } from '../../events/view/view-created.event';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';
 

@Injectable()
export class ViewConsumer implements OnModuleInit {

  private readonly logger =
    new Logger(ViewConsumer.name);

  constructor(

    private readonly kafka:KafkaService,

    private readonly redisCounter:RedisCounterService,
  ) {}

  async onModuleInit(){
    await this.start();
  }

   
async start(){

  await this.kafka.consume<ViewCreatedEvent>(

    'view-group',

    KAFKA_TOPICS.VIEW_CREATED,

    async(event) => {

      if (!event.meaningful){
        return;
      }

      await this.redisCounter.incrementViews(
        event.postId,
      );

      await this.redisCounter.incrementDwell(
        event.postId,
        event.dwellTimeMs,
      );

      const views =
        await this.redisCounter.getViewsCount(
          event.postId,
        );

      const dwellTimeMs =
        await this.redisCounter.getDwellTime(
          event.postId,
        );

      const completionRate =
        event.media?.length

          ? event.media.reduce(

              (sum,item) =>
                sum + item.completionRate,

              0,
            ) / event.media.length

          : 0;

      await this.kafka.emit(

        KAFKA_TOPICS.ENGAGEMENT_UPDATED,

        {

          postId:
            event.postId,

          likes:0,

          comments:0,

          reposts:0,

          bookmarks:0,

          views,

          dwellTimeMs,

          completionRate,

          createdAt:
            event.createdAt,

          authorId:'',
        },
      );

      this.logger.log(`👁️ View recorded: ${event.postId}`,
      );
    },
  );

  this.logger.log(
    '✅ ViewConsumer started',
  );
}
   
  }
