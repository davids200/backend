import {
  Injectable,
} from '@nestjs/common';

import { KafkaService }
from '../../infrastructure/kafka/kafka.service';

@Injectable()
export class AuthProducer {
  constructor(
    private readonly kafka:
      KafkaService,
  ) {}

  // =====================================================
  // USER REGISTERED
  // =====================================================

  async userRegistered(data: {
    userId: string;
  }) {

    await this.kafka.emit(
      'auth.user.registered',
      data,
      data.userId,
    );
  }

  // =====================================================
  // USER LOGGED IN
  // =====================================================

  async userLoggedIn(data: {
    userId: string;
  }) {

    await this.kafka.emit(
      'auth.user.logged_in',
      data,
      data.userId,
    );
  }

  // =====================================================
  // OTP REQUESTED
  // =====================================================

  async otpRequested(data: {
    type: 'email' | 'phone';
    value: string;
  }) {

    await this.kafka.emit(
      'auth.otp.requested',
      data,
      data.value,
    );
  }
}