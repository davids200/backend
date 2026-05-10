import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';

import { ScyllaService }
from '../infrastructure/scylladb/scylla.service';

import { KafkaService }
from '../infrastructure/kafka/kafka.service';

import { KafkaBootstrapService }
from '../infrastructure/kafka/kafka.bootstrap';

import { MinioService }
from '../infrastructure/minio/minio.service';

// =====================================================
// CONSUMERS
// =====================================================

import { FeedConsumer }
from '../workers/feed/feed.consumer';

import { NotificationConsumer }
from '../workers/notification/notification.consumer';

import { FollowConsumer }
from '../workers/follow/follow.consumer';

import { LikeConsumer }
from '../workers/like/like.consumer';

import { PostConsumer }
from '../workers/post/post.consumer';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap
{
  private readonly logger =    new Logger(      BootstrapService.name,    );

  constructor(

    // =====================================================
    // INFRASTRUCTURE
    // =====================================================

    private readonly scylla:
      ScyllaService,

    private readonly kafka:
      KafkaService,

    private readonly kafkaBootstrap:
      KafkaBootstrapService,

    private readonly minio:
      MinioService,

    // =====================================================
    // CONSUMERS
    // =====================================================

    private readonly feedConsumer:
      FeedConsumer,

    private readonly notificationConsumer:
      NotificationConsumer,

    private readonly followConsumer:
      FollowConsumer,

    private readonly likeConsumer:
      LikeConsumer,

    private readonly postConsumer:
      PostConsumer,
  ) {
 console.log(
      '🔥 CONSTRUCTOR',
    );

  }

  // =====================================================
  // APPLICATION BOOTSTRAP
  // =====================================================

  

  async onApplicationBootstrap() {

    this.logger.log(
      '🚀 Bootstrapping system...',
    );

    try {

console.log('STEP 1');
await this.scylla.onModuleInit();

console.log('STEP 2');
await this.minio.onModuleInit();

console.log('STEP 3');
await this.kafka.onModuleInit();

console.log('STEP 4');
await this.kafkaBootstrap.bootstrapTopics();

console.log('STEP 5');

await Promise.all([
  this.feedConsumer.start(),
  this.notificationConsumer.start(),
  this.followConsumer.start(),
  this.likeConsumer.start(),
  this.postConsumer.start(),
]);

console.log('STEP 6');




      // ================================================
      // 1. INITIALIZE SCYLLADB
      // ================================================

      await this.scylla.onModuleInit();

      this.logger.log(
        '✅ ScyllaDB initialized',
      );

      // ================================================
      // 2. INITIALIZE MINIO
      // ================================================

      await this.minio.onModuleInit();

      this.logger.log(
        '✅ MinIO initialized',
      );

      // ================================================
      // 3. INITIALIZE KAFKA PRODUCER
      // ================================================

      await this.kafka.onModuleInit();

      this.logger.log(
        '✅ Kafka producer initialized',
      );

      // ================================================
      // 4. CREATE KAFKA TOPICS
      // ================================================

      await this.kafkaBootstrap
        .bootstrapTopics();

      this.logger.log(
        '✅ Kafka topics initialized',
      );

      // ================================================
      // 5. START CONSUMERS
      // ================================================

      await Promise.all([ 

        this.feedConsumer.start(),

        this.notificationConsumer.start(),

        this.followConsumer.start(),

        this.likeConsumer.start(),

        this.postConsumer.start(),
      ]);

      this.logger.log(
        '✅ Kafka consumers started',
      );

      // ================================================
      // SYSTEM READY
      // ================================================

      this.logger.log(
        '🔥 System bootstrap complete',
      );

    } catch (error) {

      this.logger.error(
        '❌ Bootstrap failed',
        error,
      );

      throw error;
    }
  }
}