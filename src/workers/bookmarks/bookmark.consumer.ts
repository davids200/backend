import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';
 

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { RedisBookmarkCounterService } from '../../infrastructure/redis/counters/bookmark/redis.bookmark.counter';

@Injectable()
export class BookmarkConsumer
implements OnModuleInit {

  private readonly logger =
    new Logger(
      BookmarkConsumer.name,
    );

  constructor(
    private readonly kafka: KafkaService,
    private readonly counter: RedisBookmarkCounterService,
  ) {}

  async onModuleInit(){
    await this.start();
  }

  async start(){
    // ================================================
    // BOOKMARK CREATED
    // ================================================

    await this.kafka.consume(
      'bookmark-created-group',
      KAFKA_TOPICS.BOOKMARK_CREATED,

      async (event:any) => {

        try {
          await this.handleBookmarkCreated(event,  );

        } catch(error){

          this.logger.error('❌ Bookmark create failed',  error,       );
        }
      },
    );



    
    // ================================================
    // BOOKMARK REMOVED
    // ================================================

    await this.kafka.consume(

      'bookmark-removed-group',

      KAFKA_TOPICS
        .BOOKMARK_REMOVED,

      async (event:any) => {

        try {

          await this.handleBookmarkRemoved(
            event,
          );

        } catch(error){

          this.logger.error(

            '❌ Bookmark remove failed',

            error,
          );
        }
      },
    );

    this.logger.log(
      '✅ BookmarkConsumer started',
    );
  }

  // ================================================
  // CREATED
  // ================================================

  private async handleBookmarkCreated(
    event:any,
  ){

    console.log(
      'BOOKMARK CREATED EVENT',
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
      .incrementBookmarks(
        postId,
      );

    await this.kafka.emit(

      KAFKA_TOPICS
        .ENGAGEMENT_SIGNAL,

      {

        postId,

        actorId:
          event.userId,

        type:'BOOKMARK',

        createdAt:
          event.createdAt,
      },
    );

    this.logger.log(

      `🔖 Bookmark created: ${postId}`,
    );
  }

  // ================================================
  // REMOVED
  // ================================================

  private async handleBookmarkRemoved(
    event:any,
  ){

    console.log(
      'BOOKMARK REMOVED EVENT',
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
      .decrementBookmarks(
        postId,
      );

    await this.kafka.emit(

      KAFKA_TOPICS
        .ENGAGEMENT_SIGNAL,

      {

        postId,

        actorId:
          event.userId,

        type:'BOOKMARK',

        createdAt:
          event.createdAt,
      },
    );

    this.logger.log(

      `🗑️ Bookmark removed: ${postId}`,
    );
  }
}