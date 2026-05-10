import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { NotificationService }
from '../../modules/notification/notification.service';

import { KAFKA_TOPICS }
from '../../common/constants/kafka-topics.constants';

// =====================================================
// EVENT TYPE
// =====================================================

type NotificationCreatedEvent = {

  userId: string;

  actorId?: string;

  type: string;

  referenceId?: string;

  createdAt?: string;
};

@Injectable()
export class NotificationConsumer {

  private readonly logger =
    new Logger(
      NotificationConsumer.name,
    );

  constructor(

    private readonly kafka:
      KafkaService,

    private readonly notifications:
      NotificationService,
  ) {}

  // =====================================================
  // START CONSUMER
  // =====================================================

  async start() {

    this.logger.log(
      '🚀 Starting NotificationConsumer...',
    );

    await this.kafka.consume<NotificationCreatedEvent>(

      'notification-group',

      KAFKA_TOPICS.NOTIFICATION_CREATED,

      async (event) => {

        try {

          await this.handleNotification(
            event,
          );

        } catch (err) {

          this.logger.error(
            '❌ Notification consumer error',
            err,
          );
        }
      },
    );

    this.logger.log(
      '✅ NotificationConsumer started',
    );
  }

  // =====================================================
  // HANDLE NOTIFICATION
  // =====================================================

  private async handleNotification(
    event: NotificationCreatedEvent,
  ) {

    await this.notifications.create({

      userId:
        event.userId,

      actorId:
        event.actorId,

      type:
        event.type,

      referenceId:
        event.referenceId,
    });

    this.logger.log(

      `🔔 Notification created for ${event.userId}`,
    );
  }
}