import {  Injectable,  Logger,} from '@nestjs/common';
import { KafkaService }from '../../infrastructure/kafka/kafka.service';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

import { FeedProducer }
from '../../modules/feed/feed.producer';

import { NotificationProducer }
from '../../modules/notification/notification.producer';

import { PostCreatedEvent }
from '../../common/constants/contracts/events/post-created.event';

@Injectable()
export class PostConsumer {
  private readonly logger =new Logger(PostConsumer.name,);
  private started = false;  

  constructor(
    private readonly kafka: KafkaService,
    private readonly feed: FeedProducer,
    private readonly notification: NotificationProducer,
  ) {
 this.logger.log('✅ PostConsumer Constructor...................');

  }

  async onModuleInit(): Promise<void> {
    this.logger.log('✅ PostConsumer initialized...............');

    try {
      this.logger.log('🔥 Bootstrap starting...');
      await this.bootstrap();
      this.logger.log('✅ Bootstrap complete');
    } catch (err) {
      this.logger.error('❌ Bootstrap failed', err);
    }
  }

  // =====================================================
  // BOOTSTRAP
  // =====================================================

  private async bootstrap() {

    if (this.started) {
      return;
    }

    this.started = true;

    await this.start();
  }

  // =====================================================
  // START CONSUMER
  // =====================================================

  async start() {  console.log(
  '🚀 START METHOD ENTERED',
);

    this.logger.log(
      '🚀 Starting PostConsumer...',
    );

    await this.kafka.consume<PostCreatedEvent>(

      'post-group',

      KAFKA_TOPICS.POST_CREATED,

      async (event) => {

        this.logger.log(

          `📩 EVENT: ${event.postId}`,
        );

        await this.handlePostCreated(
          event,
        );
      },
    );
  }

  // =====================================================
  // HANDLE POST CREATED
  // =====================================================

  private async handlePostCreated(
    event: PostCreatedEvent,
  ) {

    this.logger.log(

      `📝 Processing: ${event.postId}`,
    );

    await this.feed.fanoutPost({

      postId:
        event.postId,

      authorId:
        event.authorId,

      visibility:
        event.visibility,

      createdAt:
        event.createdAt,

      locationId:
        event.locationId,
    });

    if (
      event.mentions?.length
    ) {

      await Promise.all(

        event.mentions.map(

          async (mentionUserId) => {

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