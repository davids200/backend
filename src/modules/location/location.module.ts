import { Module } from '@nestjs/common'; 
import { PostgresModule } from '../../infrastructure/postgresql/postgres.module';
import { KafkaModule } from '../../infrastructure/kafka/kafka.module';
import { LocationService } from './location.service';
import { LocationResolver } from './location.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from './location.entity';
@Module({
  imports: [
    PostgresModule, 
    KafkaModule,
  TypeOrmModule.forFeature([LocationEntity]), 
    KafkaModule,
  ],
  providers: [LocationService, LocationResolver],
  exports:[LocationService]
})
export class LocationModule {}