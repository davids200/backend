// src/workers/repost/repost.consumer.ts

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
import { RepostCreatedEvent } from '../../events/repost/repost-created.event';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';
 

@Injectable()
export class RepostConsumer
  implements OnModuleInit
{
  private readonly logger =
    new Logger(
      RepostConsumer.name,
    );

  constructor(
    private readonly kafka:KafkaService,
    private readonly feed:FeedProducer,
    private readonly notification:NotificationProducer,
  ) {}

  async onModuleInit() {

    await this.start();
  }

  async start() {

    await this.kafka.consume<RepostCreatedEvent>(
      'repost-group',
      KAFKA_TOPICS.REPOST_CREATED,

      async (event) => {

        await this.handleRepost(
          event,
        );
      },
    );
  }

  private async handleRepost(
    event: RepostCreatedEvent,
  ) {

    // ============================================
    // FANOUT INTO FEED
    // ============================================

    await this.feed.fanoutPost({
      postId:event.postId,
      authorId:event.userId,
      visibility:'public',
      createdAt:event.createdAt,
    });

    // ============================================
    // NOTIFY ORIGINAL AUTHOR
    // ============================================

    await this.notification.sendNotification({

        userId:
          event.originalAuthorId,

        actorId:
          event.userId,

        type:
          'repost',

        referenceId:
          event.postId,

        createdAt:
          event.createdAt,
      });

    this.logger.log(

      `🔁 Repost processed: ${event.postId}`,
    );
  }
}