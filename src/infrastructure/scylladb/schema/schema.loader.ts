import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { ScyllaService }
from '../scylla.service';

import { FEED_SCHEMA }
from './feed.schema';

@Injectable()
export class ScyllaSchemaLoader
  implements OnModuleInit
{

  private readonly logger =
    new Logger(
      ScyllaSchemaLoader.name,
    );

  constructor(

    private readonly scylla:
      ScyllaService,
  ) {}

  // =====================================================
  // MODULE INIT
  // =====================================================

  async onModuleInit() {

    await this.load();
  }

  // =====================================================
  // LOAD SCHEMAS
  // =====================================================

  async load() {

    this.logger.log(
      '🚀 Initializing Scylla schema...',
    );

    // ================================================
    // DEVELOPMENT RESET (OPTIONAL)
    // ================================================

    // await this.resetKeyspace();

    // ================================================
    // CREATE KEYSPACE
    // ================================================

    await this.createKeyspace();

    // ================================================
    // CREATE TABLES
    // ================================================

    await this.executeSchema(
      FEED_SCHEMA,
    );

    this.logger.log(
      '✅ Scylla tables ready',
    );
  }

  // =====================================================
  // CREATE KEYSPACE
  // =====================================================

  private async createKeyspace() {

    await this.scylla.execute(

      `
      CREATE KEYSPACE IF NOT EXISTS social_app

      WITH replication = {

        'class': 'SimpleStrategy',

        'replication_factor': 1
      }
      `,
    );

    this.logger.log(
      '✅ Keyspace ready',
    );
  }

  // =====================================================
  // DEV RESET
  // =====================================================

  private async resetKeyspace() {

    this.logger.warn(
      '⚠️ Dropping keyspace...',
    );

    await this.scylla.execute(

      `
      DROP KEYSPACE IF EXISTS social_app
      `,
    );

    this.logger.warn(
      '⚠️ Keyspace dropped',
    );
  }

  // =====================================================
  // EXECUTE SCHEMAS
  // =====================================================

  private async executeSchema(
    schemas: string[],
  ) {

    for (const query of schemas) {

      try {

        await this.scylla.execute(
          query,
        );

        this.logger.log(
          '✅ Schema executed',
        );

      } catch (error) {

        this.logger.error(
          '❌ Schema failed',
        );

        this.logger.error(
          query,
        );

        this.logger.error(
          error,
        );

        // IMPORTANT:
        // Continue instead of crashing
        continue;
      }
    }
  }
}