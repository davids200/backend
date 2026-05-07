import {
  Injectable,
  Logger,
} from '@nestjs/common';

import { Resend }
from 'resend';

@Injectable()
export class EmailService {

  private readonly logger =
    new Logger(
      EmailService.name,
    );

  private readonly resend =
    new Resend(
      process.env
        .RESEND_API_KEY,
    );

  // =====================================================
  // SEND OTP
  // =====================================================

  async sendOtp(params: {
    email: string;
    otp: string;
  }) {

    const {
      email,
      otp,
    } = params;

    await this.resend.emails.send({

      from:
        process.env
          .EMAIL_FROM!,

      to:
        email,

      subject:
        'Your OTP Code',

      html: `
        <h2>Your OTP Code</h2>

        <p>
          Your verification code is:
        </p>

        <h1>${otp}</h1>

        <p>
          This OTP expires shortly.
        </p>
      `,
    });

    this.logger.log(
      `OTP email sent to ${email}`,
    );
  }

  // =====================================================
  // SECURITY ALERT
  // =====================================================

  async sendSecurityAlert(params: {
    email: string;
    device?: string;
    location?: string;
  }) {

    const {
      email,
      device,
      location,
    } = params;

    await this.resend.emails.send({

      from:
        process.env
          .EMAIL_FROM!,

      to:
        email,

      subject:
        'Suspicious Login Detected',

      html: `
        <h2>Security Alert</h2>

        <p>
          We detected a suspicious login.
        </p>

        <p>
          Device:
          ${device || 'Unknown'}
        </p>

        <p>
          Location:
          ${location || 'Unknown'}
        </p>

        <p>
          If this wasn't you,
          please secure your account.
        </p>
      `,
    });

    this.logger.log(
      `Security alert sent to ${email}`,
    );
  }

  // =====================================================
  // WELCOME EMAIL
  // =====================================================

  async sendWelcome(params: {
    email: string;
    username?: string;
  }) {

    const {
      email,
      username,
    } = params;

    await this.resend.emails.send({

      from:
        process.env
          .EMAIL_FROM!,

      to:
        email,

      subject:
        'Welcome',

      html: `
        <h2>
          Welcome ${
            username || ''
          }
        </h2>

        <p>
          Your account has been created successfully.
        </p>
      `,
    });

    this.logger.log(
      `Welcome email sent to ${email}`,
    );
  }
}