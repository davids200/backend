import { Module } from '@nestjs/common';  
import { LocationService } from './location.service';
import { LocationResolver } from './location.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationEntity } from './location.entity';
import { RedisModule } from '../../infrastructure/redis/redis.module'; 

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