import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common'; 
import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { RedisCounterService } from '../../infrastructure/redis/counters/redis.counter.service';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';


@Injectable()
export class BookmarkConsumer
implements OnModuleInit {

  private readonly logger =
    new Logger(
      BookmarkConsumer.name,
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

    // =================================================
    // BOOKMARK CREATED
    // =================================================

    await this.kafka.consume(

      'bookmark-group',

      KAFKA_TOPICS
        .BOOKMARK_CREATED,

      async (event:any) => {

        await this.handleBookmarkCreated(
          event,
        );
      },
    );

    // =================================================
    // BOOKMARK REMOVED
    // =================================================

    await this.kafka.consume(

      'bookmark-group',

      KAFKA_TOPICS
        .BOOKMARK_REMOVED,

      async (event:any) => {

        await this.handleBookmarkRemoved(
          event,
        );
      },
    );

    this.logger.log(
      '✅ BookmarkConsumer started',
    );
  }

  // ===================================================
  // HANDLE BOOKMARK CREATED
  // ===================================================

  private async handleBookmarkCreated(
    event:any,
  ){

    await this.counter.incrementBookmarks(
      event.targetId,
    );

    await this.kafka.emit(

      KAFKA_TOPICS
        .ENGAGEMENT_SIGNAL,

      {

        postId:
          event.targetId,

        actorId:
          event.userId,

        type:'BOOKMARK',

        createdAt:
          new Date()
            .toISOString(),
      },
    );

    this.logger.log(

      `🔖 Bookmark created: ${event.targetId}`,
    );
  }

  // ===================================================
  // HANDLE BOOKMARK REMOVED
  // ===================================================

  private async handleBookmarkRemoved(
    event:any,
  ){

    await this.counter.decrementBookmarks(
      event.targetId,
    );

    await this.kafka.emit(

      KAFKA_TOPICS
        .ENGAGEMENT_SIGNAL,

      {

        postId:
          event.targetId,

        actorId:
          event.userId,

        type:'BOOKMARK',

        createdAt:
          new Date()
            .toISOString(),
      },
    );

    this.logger.log(

      `❌ Bookmark removed: ${event.targetId}`,
    );
  }
}