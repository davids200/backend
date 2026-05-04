import { Module } from '@nestjs/common'; 
import { KafkaModule } from '../infrastructure/kafka/kafka.module';
import { RedisModule } from '../infrastructure/redis/redis.module';
import { PostgresModule } from '../infrastructure/postgresql/postgres.module'; 
import { MinioModule } from '../infrastructure/minio/minio.module';
import { ScyllaModule } from '../infrastructure/scylladb/scylla.module';
import { BootstrapService } from './bootstrap.service';

@Module({
  imports: [
    KafkaModule,
  RedisModule,
  PostgresModule,
  ScyllaModule,
  MinioModule,
  ],
  providers: [BootstrapService],
})
export class BootstrapModule {}