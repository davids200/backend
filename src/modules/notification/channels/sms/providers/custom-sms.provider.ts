import {
  Injectable,
  Logger,
} from '@nestjs/common';

import axios
from 'axios'; 
import { SmsProvider } from '../interfaces/sms-provider.interface';


@Injectable()
export class CustomSmsProvider
  implements SmsProvider
{
  private readonly logger =
    new Logger(
      CustomSmsProvider.name,
    );

  // =====================================================
  // SEND OTP
  // =====================================================

  async sendOtp(params: {
    phone: string;
    otp: string;
  }) {

    const {
      phone,
      otp,
    } = params;

    const url =
      `${process.env.SMS_API_URL}` +
      `?to=${phone}` +
      `&message=Your OTP is ${otp}`;

    await axios.get(url);

    this.logger.log(
      `SMS sent via custom API to ${phone}`,
    );
  }
}