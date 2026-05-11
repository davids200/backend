import {
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';

import { ScyllaService } from '../scylla.service';
import { FEED_SCHEMA } from './feed.schema';

@Injectable()
export class ScyllaSchemaLoader implements OnModuleInit {
  private readonly logger = new Logger(ScyllaSchemaLoader.name);

  constructor(
    private readonly scylla: ScyllaService,
  ) {}

  async onModuleInit() {
    // 1. Wait for the Service to finish its 3-second sleep and real client connection
    await this.scylla.waitReady();
    
    // 2. Now it is safe to load
    await this.load();
  }

  async load() {
    this.logger.log('🚀 Creating Scylla tables...');

    await this.executeSchema(FEED_SCHEMA);

    this.logger.log('✅ Scylla tables ready');
  }

  private async executeSchema(schemas: string[]) {
    for (const query of schemas) {
      try {
        // Use the service's execute method rather than accessing the client property directly
        // This ensures proper 'prepare: true' settings and initialization checks
        await this.scylla.execute(query);

        this.logger.log('✅ Schema executed');
      } catch (error) {
        this.logger.error('❌ Schema failed');
        this.logger.error(query);
        this.logger.error(error);

        throw error;
      }
    }
  }
}