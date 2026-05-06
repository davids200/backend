import {
  Injectable,
  Logger,
  OnModuleDestroy,
} from '@nestjs/common';
import Redis from 'ioredis'; 
import { RedisService } from '../../../infrastructure/redis/redis.service';

@Injectable()
export class RedisPubSubService
  implements OnModuleDestroy
{
  private readonly logger =
    new Logger(RedisPubSubService.name);

  private readonly subscriber: Redis;

  constructor(
    private readonly redis: RedisService,
  ) {

    // ============================================
    // SEPARATE SUBSCRIBER CONNECTION
    // ============================================

    this.subscriber =
      this.redis.client.duplicate();
  }

  // =====================================================
  // PUBLISH EVENT
  // =====================================================

  async publish(
    channel: string,
    data: unknown,
  ) {

    await this.redis.client.publish(
      channel,
      JSON.stringify(data),
    );
  }

  // =====================================================
  // SUBSCRIBE TO CHANNEL
  // =====================================================

  async subscribe(
    channel: string,

    callback: (
      message: unknown,
    ) => void,
  ) {

    await this.subscriber.subscribe(
      channel,
    );

    this.logger.log(
      `Subscribed to ${channel}`,
    );

    this.subscriber.on(
      'message',
      async (
        receivedChannel,
        message,
      ) => {

        if (
          receivedChannel !== channel
        ) {
          return;
        }

        try {

          const parsed =
            JSON.parse(message);

          callback(parsed);

        } catch (err) {

          this.logger.error(
            `Invalid Redis PubSub message on ${channel}`,
            err,
          );
        }
      },
    );
  }

  // =====================================================
  // CLEANUP
  // =====================================================

  async onModuleDestroy() {

    await this.subscriber.quit();
  }
}