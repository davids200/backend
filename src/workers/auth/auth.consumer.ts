import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

@Injectable()
export class AuthConsumer
  implements OnModuleInit
{
  private readonly logger =
    new Logger(
      AuthConsumer.name,
    );

  constructor(
    private readonly kafka:
      KafkaService,
  ) {}

  async onModuleInit() {

    await this.start();
  }

  // =====================================================
  // START CONSUMER
  // =====================================================

  private async start() {

    // ================================================
    // OTP REQUESTED
    // ================================================

    await this.kafka.consume(

      'auth-worker-group',

      'auth.otp.requested',

      async (message) => {

        if (!message.value) {
          return;
        }

        const data =
          JSON.parse(
            message.value.toString(),
          );

        await this.handleOtp(
          data,
        );
      },
    );

    this.logger.log(
      '✅ AuthConsumer started',
    );
  }

  // =====================================================
  // HANDLE OTP
  // =====================================================

  private async handleOtp(data: {
    type: 'email' | 'phone';
    value: string;
  }) {

    // ================================================
    // TEMP MOCK
    // ================================================

    if (data.type === 'phone') {

      this.logger.log(
        `📱 Send SMS OTP to ${data.value}`,
      );
    }

    if (data.type === 'email') {

      this.logger.log(
        `📧 Send Email OTP to ${data.value}`,
      );
    }
  }
}