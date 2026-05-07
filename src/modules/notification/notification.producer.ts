import {
  Injectable,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

@Injectable()
export class NotificationProducer {

  constructor(
    private readonly kafka:
      KafkaService,
  ) {}

  // =====================================================
  // GENERIC EVENT
  // =====================================================

  async emit(
    topic: string,
    payload: unknown,
    key?: string,
  ) {

    await this.kafka.emit(

      topic,

      payload,

      key,
    );
  }

  // =====================================================
  // OTP
  // =====================================================

  async otpRequested(data: {
    type: 'email' | 'phone';
    value: string;
  }) {

    await this.emit(

      'notification.otp.requested',

      data,

      data.value,
    );
  }

  // =====================================================
  // SECURITY ALERT
  // =====================================================

  async securityAlert(data: {
    userId: string;
    email?: string;
    device?: string;
    location?: string;
  }) {

    await this.emit(

      'notification.security.alert',

      data,

      data.userId,
    );
  }

  // =====================================================
  // WELCOME
  // =====================================================

  async welcome(data: {
    userId: string;
    email?: string;
    username?: string;
  }) {

    await this.emit(

      'notification.welcome',

      data,

      data.userId,
    );
  }




// =====================================================
// IN-APP NOTIFICATION
// =====================================================

async sendNotification(data: {
userId: string;
type: string;
referenceId?: string;
actorId?: string;
createdAt?: string;
}) {
await this.emit('notification.inapp.created',data,data.userId,);
}



}