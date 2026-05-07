import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';

import { ScyllaService } from '../infrastructure/scylladb/scylla.service';
import { KafkaService } from '../infrastructure/kafka/kafka.service';
import { MinioService } from '../infrastructure/minio/minio.service'; 
import { FeedConsumer } from '../workers/feed/feed.consumer';
import { NotificationConsumer } from '../workers/notification/notification.consumer';

 
@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    private readonly scylla: ScyllaService,
    private readonly kafka: KafkaService,
    private readonly minio: MinioService,
    private readonly feedConsumer: FeedConsumer,
    private readonly notificationConsumer: NotificationConsumer,
  ) {}

  async onApplicationBootstrap() {
   // this.logger.log('🚀 Bootstrapping system...');

    try {
      // 1. Init ScyllaDB schema
      await this.scylla.onModuleInit();
     // this.logger.log('✔ ScyllaDB initialized');

      // 2. Init MinIO buckets
      await this.minio.onModuleInit();
     // this.logger.log('✔ MinIO initialized');

      // 3. Init Kafka producer
      await this.kafka.onModuleInit();
     // this.logger.log('✔ Kafka producer initialized');

      // 4. Start consumers explicitly (IMPORTANT)
      // await this.feedConsumer.onModuleInit();
      // this.logger.log('✔ Feed consumer started');

      await this.notificationConsumer.onModuleInit();
    //  this.logger.log('✔ Notification consumer started');

    //  this.logger.log('🔥 Bootstrap complete — system is live');
    } catch (error) {
     // this.logger.error('❌ Bootstrap failed', error);
      throw error;
    }
  }
}