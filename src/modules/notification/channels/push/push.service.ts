import {
  Injectable,
  Logger,
} from '@nestjs/common';

@Injectable()
export class PushService {

  private readonly logger =
    new Logger(
      PushService.name,
    );

  // =====================================================
  // SEND PUSH
  // =====================================================

  async send(params: {
    userId: string;
    title: string;
    body: string;
  }) {

    const {
      userId,
      title,
      body,
    } = params;

    // TODO:
    // Firebase FCM integration

    this.logger.log(
      `Push notification queued for ${userId}`,
    );

    this.logger.debug(
      `${title} - ${body}`,
    );
  }
}