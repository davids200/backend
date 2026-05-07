import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { TwilioProvider }
from './providers/twilio.provider';

import { CustomSmsProvider }
from './providers/custom-sms.provider';

@Injectable()
export class SmsGatewayService {

  private readonly logger =
    new Logger(
      SmsGatewayService.name,
    );

  constructor(

    private readonly twilio:
      TwilioProvider,

    private readonly custom:
      CustomSmsProvider,
  ) {}

  // =====================================================
  // SEND OTP
  // =====================================================

  async sendOtp(params: {
    phone: string;
    otp: string;
  }) {

    // ================================================
    // PRIMARY PROVIDER
    // ================================================

    try {

      await this.custom.sendOtp(
        params,
      );

      return;

    } catch (err) {

      this.logger.warn(
        'Custom SMS provider failed',
      );
    }

    // ================================================
    // FALLBACK PROVIDER
    // ================================================

    await this.twilio.sendOtp(
      params,
    );
  }
}