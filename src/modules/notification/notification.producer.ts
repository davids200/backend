import {  Injectable,} from '@nestjs/common';
import { KafkaService }from '../../infrastructure/kafka/kafka.service';
import { KAFKA_TOPICS }from '../../common/constants/kafka-topics.constants'; 
import { OtpRequestedEvent } from '../../common/constants/contracts/events/otp-requested.event';
import { SecurityAlertEvent } from '../../common/constants/contracts/events/security-alert.event';
import { WelcomeNotificationEvent } from '../../common/constants/contracts/events/welcome-notification.event';
import { NotificationCreatedEvent } from '../../common/constants/contracts/events/notification-created.event';

@Injectable()
export class NotificationProducer {

  constructor(
    private readonly kafka:
      KafkaService,
  ) {}

  // =====================================================
  // GENERIC EMIT
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

  async otpRequested(
    data: OtpRequestedEvent,
  ) {
    await this.emit(
      KAFKA_TOPICS.NOTIFICATION_OTP_REQUESTED,
      data,
      data.value,
    );
  }

  // =====================================================
  // SECURITY ALERT
  // =====================================================

  async securityAlert(
    data: SecurityAlertEvent,
  ) {
    await this.emit(
      KAFKA_TOPICS.NOTIFICATION_SECURITY_ALERT,
      data,
      data.userId,
    );
  }

  // =====================================================
  // WELCOME
  // =====================================================

  async welcome(
    data: WelcomeNotificationEvent,
  ) {
    await this.emit(
      KAFKA_TOPICS.NOTIFICATION_WELCOME,
      data,
      data.userId,
    );
  }

  // =====================================================
  // IN-APP NOTIFICATION
  // =====================================================

  async sendNotification(
    data: NotificationCreatedEvent,
  ) {
    await this.emit(
      KAFKA_TOPICS.NOTIFICATION_CREATED,
      data,
      data.userId,
    );
  }
}