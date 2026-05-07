import {
  Injectable,
  Logger,
} from '@nestjs/common';

import Twilio, {
  Twilio as TwilioClient,
} from 'twilio';
import { SmsProvider } from '../interfaces/sms-provider.interface';
 

@Injectable()
export class TwilioProvider
  implements SmsProvider
{
  private readonly logger =
    new Logger(
      TwilioProvider.name,
    );

  private client?:
    TwilioClient;

  // =====================================================
  // GET CLIENT
  // =====================================================

  private getClient() {

    if (this.client) {
      return this.client;
    }

    const sid =
      process.env
        .TWILIO_ACCOUNT_SID;

    const token =
      process.env
        .TWILIO_AUTH_TOKEN;

    // ================================================
    // OPTIONAL PROVIDER
    // ================================================

    if (
      !sid ||
      !token ||
      !sid.startsWith('AC')
    ) {

      this.logger.warn(
        'Twilio credentials missing',
      );

      return null;
    }

    this.client =
      Twilio(
        sid,
        token,
      );

    return this.client;
  }

  // =====================================================
  // SEND OTP
  // =====================================================

  async sendOtp(params: {
    phone: string;
    otp: string;
  }) {

    const client =
      this.getClient();

    if (!client) {

      throw new Error(
        'Twilio not configured',
      );
    }

    const {
      phone,
      otp,
    } = params;

    await client.messages.create({

      to:
        phone,

      from:
        process.env
          .TWILIO_PHONE_NUMBER,

      body:
        `Your OTP is ${otp}`,
    });

    this.logger.log(
      `SMS sent via Twilio to ${phone}`,
    );
  }
}