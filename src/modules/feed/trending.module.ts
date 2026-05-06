// src/modules/feed/trending.module.ts

import { Module } from '@nestjs/common';
import { RedisModule } from '../../infrastructure/redis/redis.module';
import { TrendingService } from './services/trending.service';
import { RedisTrendingService } from '../../infrastructure/redis/trending/redis.trending.service';

@Module({
  imports: [RedisModule],
  providers: [TrendingService, RedisTrendingService],
  exports: [TrendingService], // ✅ make it usable outside
})
export class TrendingModule {}