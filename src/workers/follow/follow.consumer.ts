import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService } from '../../infrastructure/kafka/kafka.service';
import { RedisService } from '../../infrastructure/redis/redis.service';
import { KAFKA_TOPICS } from '../../common/constants/kafka-topics.constants';

type FollowEvent = { followerId: string; followingId: string };

@Injectable()
export class FollowConsumer implements OnModuleInit {
  private readonly logger = new Logger(FollowConsumer.name);

  constructor(
    private readonly kafka: KafkaService,
    private readonly redis: RedisService,
  ) {}

  async onModuleInit() {
    await this.start();
  }

  async start() {
    this.logger.log('🚀 Starting FollowConsumer...');

    // FOLLOW CREATED
    await this.kafka.consume<FollowEvent>(
      'follow-created-group',
      KAFKA_TOPICS.FOLLOW_CREATED,
      async (event) => this.handleFollowAction(event, 'ADD'),
    );

    // FOLLOW REMOVED
    await this.kafka.consume<FollowEvent>(
      'follow-removed-group',
      KAFKA_TOPICS.FOLLOW_REMOVED,
      async (event) => this.handleFollowAction(event, 'REMOVE'),
    );
  }

  private async handleFollowAction(event: FollowEvent, action: 'ADD' | 'REMOVE') {
    try {
      // 1. Clean IDs (Handle potential object-passing bugs)
      const fId = typeof event.followerId === 'object' ? (event.followerId as any).id : event.followerId;
      const tId = typeof event.followingId === 'object' ? (event.followingId as any).id : event.followingId;

      if (!fId || !tId || fId.includes('[object')) {
        this.logger.error(`⚠️ Aborted: Invalid IDs detected: ${fId} -> ${tId}`);
        return;
      }

      // 2. Use Pipeline for atomicity and speed
      const pipeline = this.redis.client.pipeline();
      
      if (action === 'ADD') {
        pipeline.sadd(`followers:${tId}`, fId);
        pipeline.sadd(`following:${fId}`, tId);
      } else {
        pipeline.srem(`followers:${tId}`, fId);
        pipeline.srem(`following:${fId}`, tId);
      }

      await pipeline.exec();
      this.logger.log(`✅ Follow Graph ${action}: ${fId} -> ${tId}`);
    } catch (error) {
      //this.logger.error(`❌ Follow ${action} error`, error.stack);
    }
  }
}