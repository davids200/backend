import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisFeedService } from './feed/redis.feed.service';
import { RedisCounterService } from './counters/redis.counter.service';

@Global()
@Module({
 providers: [RedisService, RedisFeedService, RedisCounterService],
exports: [RedisService, RedisFeedService, RedisCounterService],
})
export class RedisModule {}