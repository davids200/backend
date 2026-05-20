import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { FeedService }
from '../../modules/feed/feed.service';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

@Injectable()
export class FeedFanoutConsumer
implements OnModuleInit {

  private readonly logger =
    new Logger(
      FeedFanoutConsumer.name,
    );

  constructor(

    private readonly kafka:
      KafkaService,

    private readonly feed:
      FeedService,
  ) {}

  async onModuleInit(){

    await this.start();
  }

  async start(){

    await this.kafka.consume(

      'feed-fanout-group',

      KAFKA_TOPICS
        .FEED_FANOUT,

      async (event:any) => {

        try {

          await this.handleFanout(
            event,
          );

        } catch(error){

          this.logger.error(

            '❌ Feed fanout failed',

            error,
          );
        }
      },
    );

    this.logger.log(
      '✅ FeedFanoutConsumer started',
    );
  }

  // =====================================================
  // HANDLE FANOUT
  // =====================================================

  private async handleFanout(
    event:any,
  ){

    const {

      postId,

      authorId,

      followerIds,
    } = event;

    // ================================================
    // DISTRIBUTE TO FOLLOWERS
    // ================================================

    await this.feed
      .fanoutPost({

        postId,

        authorId,

        followerIds,
      });

    this.logger.log(

      `📨 Fanout completed: ${postId}`,
    );
  }
}