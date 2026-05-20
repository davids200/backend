import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { FeedProducer }
from '../../modules/feed/feed.producer';

import { NotificationProducer }
from '../../modules/notification/notification.producer';

import { RedisFollowService }
from '../../infrastructure/redis/follow/redis.follow.service';

import { PostCreatedEvent }
from '../../events/post/post-created.event';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

@Injectable()
export class PostConsumer
implements OnModuleInit {

  private readonly logger =
    new Logger(
      PostConsumer.name,
    );

  private started = false;

  constructor(

    private readonly kafka:
      KafkaService,

    private readonly feed:
      FeedProducer,

    private readonly notification:
      NotificationProducer,

    private readonly followRedis:
      RedisFollowService,
  ) {

    console.log(
      '✅ PostConsumer initialized',
    );
  }

  // =====================================================
  // MODULE INIT
  // =====================================================

  async onModuleInit(){

    try {

      await this.bootstrap();

    } catch(error){

      this.logger.error(

        '❌ Bootstrap failed',

        error,
      );
    }
  }

  // =====================================================
  // BOOTSTRAP
  // =====================================================

  private async bootstrap(){

    if (this.started){

      return;
    }

    this.started = true;

    await this.start();

    this.logger.log(
      '✅ PostConsumer bootstrapped',
    );
  }

  // =====================================================
  // START CONSUMER
  // =====================================================

  private async start(){

    await this.kafka.consume<

      PostCreatedEvent

    >(

      'post-group',

      KAFKA_TOPICS
        .POST_CREATED,

      async (event) => {

        try {

          await this.handlePostCreated(
            event,
          );

        } catch(error){

          this.logger.error(

            '❌ Post processing failed',

            error,
          );
        }
      },
    );

    this.logger.log(
      '✅ PostConsumer started',
    );
  }

  // =====================================================
  // HANDLE POST CREATED
  // =====================================================

  private async handlePostCreated(
    event:PostCreatedEvent,
  ){

    console.log(
      '🔥 POST EVENT',
      event,
    );

    // =================================================
    // LOAD FOLLOWERS
    // =================================================

    const followerIds =

      await this.followRedis
        .getFollowers(

          event.authorId,
        );

    console.log(
      'FOLLOWERS',
      followerIds,
    );

    // =================================================
    // FEED FANOUT
    // =================================================

    await this.feed
      .fanoutPost({

        postId:
          event.postId,

        authorId:
          event.authorId,

        followerIds,

        visibility:
          event.visibility,

        createdAt:
          event.createdAt,

        locationId:
          event.locationId,

        hashtags:
          event.hashtags,
      });

    // =================================================
    // MENTIONS
    // =================================================

    if (
      event.mentions?.length
    ){

      await Promise.all(

        event.mentions.map(

          async (
            mentionUserId,
          ) => {

            await this.notification
              .sendNotification({

                userId:
                  mentionUserId,

                actorId:
                  event.authorId,

                type:
                  'mention',

                referenceId:
                  event.postId,

                createdAt:
                  event.createdAt,
              });
          },
        ),
      );
    }

    this.logger.log(

      `✅ DONE: ${event.postId}`,
    );
  }
}