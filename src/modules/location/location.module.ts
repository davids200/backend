import { Module } from '@nestjs/common'; 
import { PostgresModule } from '../../infrastructure/postgresql/postgres.module';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';
import { LocationService } from './location.service';
import { LocationResolver } from './location.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from './location.entity';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { ScyllaModule } from '../../infrastructure/scylladb/scylla.module';
import { PostModule } from '../post/post.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocationEntity]),  
     RedisModule
  ],
  providers: [LocationService, LocationResolver],
  exports:[
    LocationService,  
  ]
})
export class LocationModule {}