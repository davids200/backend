import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

import { NotificationService }
from '../../modules/notification/notification.service';

@Injectable()
export class NotificationConsumer
  implements OnModuleInit
{
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

  async onModuleInit() {

    await this.start();
  }

  // =====================================================
  // START
  // =====================================================

  private async start() {

    await this.kafka.consume(

      'notification-group',

      'notification.inapp.created',

      async (message) => {

        if (!message.value) {
          return;
        }

        try {

          const event =
            JSON.parse(
              message.value.toString(),
            );

          await this.handleNotification(
            event,
          );

        } catch (err) {

          this.logger.error(
            'Notification consumer error',
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
    event: {

      userId: string;

      actorId?: string;

      type: string;

      referenceId?: string;
    },
  ) {

    await this.notifications
      .create({

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
      `Notification created for ${event.userId}`,
    );
  }
}