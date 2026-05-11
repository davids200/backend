import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';

import { KafkaBootstrapService }
from '../infrastructure/kafka/kafka.bootstrap';
import { ScyllaSchemaLoader } from '../infrastructure/scylladb/schema/schema.loader';

@Injectable()
export class BootstrapService implements OnApplicationBootstrap {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    private readonly kafkaBootstrap: KafkaBootstrapService,
    private readonly scyllaSchemaLoader: ScyllaSchemaLoader, // Add this
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('🚀 Bootstrapping system...');

    try {
      // 1. Setup Database Schema
      await this.scyllaSchemaLoader.load();
      this.logger.log('✅ Scylla schema ready');

      // 2. Setup Kafka Topics
      await this.kafkaBootstrap.bootstrapTopics();
      this.logger.log('✅ Kafka topics ready');

      this.logger.log('🔥 System bootstrap complete');
    } catch (error) {
      this.logger.error('❌ Bootstrap failed', error);
      process.exit(1); // Force crash if infrastructure isn't ready
    }
  }
}