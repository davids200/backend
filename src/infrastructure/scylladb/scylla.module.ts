import { Module, Global } from '@nestjs/common';
import { ScyllaService } from './scylla.service'; 
import { ScyllaSchemaLoader } from './schema.loader';
import { LocationFeedRepository } from './location.feed.repo';

@Global()
@Module({
  providers: [
    ScyllaService, 
    ScyllaSchemaLoader,
  LocationFeedRepository
  ],
  exports: [
    ScyllaService,
  LocationFeedRepository
  ],
})
export class ScyllaModule {}