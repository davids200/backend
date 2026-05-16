// src/bootstrap/bootstrap.service.ts

import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';

// =====================================================
// SCYLLA
// =====================================================

import { ScyllaSchemaLoader }
from '../infrastructure/scylladb/schema/schema.loader';
import { KafkaBootstrapService } from '../infrastructure/kafka/kafka.bootstrap';

// =====================================================
// KAFKA
// =====================================================


@Injectable()
export class BootstrapService
implements OnApplicationBootstrap {

  private readonly logger =
    new Logger(
      BootstrapService.name,
    );

  constructor(

    private readonly kafkaBootstrap:
      KafkaBootstrapService,

    private readonly scyllaSchemaLoader:
      ScyllaSchemaLoader,
  ) {}

  async onApplicationBootstrap(){

    this.logger.log(
      '🚀 Bootstrapping system...',
    );

    try {

      // ================================================
      // SCYLLA SCHEMA
      // ================================================

      await this.scyllaSchemaLoader.load();

      this.logger.log(
        '✅ Scylla schema ready',
      );

      // ================================================
      // KAFKA TOPICS
      // ================================================

      await this.kafkaBootstrap
        .bootstrapTopics();

      this.logger.log(
        '✅ Kafka topics ready',
      );

      // ================================================
      // COMPLETE
      // ================================================

      this.logger.log(
        '🔥 System bootstrap complete',
      );

    } catch (error) {

      this.logger.error(
        '❌ Bootstrap failed',
        error,
      );

      process.exit(1);
    }
  }
}