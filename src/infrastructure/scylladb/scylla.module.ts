import { Module, Global } from '@nestjs/common';
import { ScyllaService } from './scylla.service'; 
import { ScyllaSchemaLoader } from './schema.loader';

@Global()
@Module({
  providers: [ScyllaService, ScyllaSchemaLoader],
  exports: [ScyllaService],
})
export class ScyllaModule {}