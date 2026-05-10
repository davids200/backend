import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisFeedService } from './feed/redis.feed.service';
import { RedisCounterService } from './counters/redis.counter.service';
import { RedisPostGuardService } from './post/redis-post-guard.service';


@Global()
@Module({
 providers: [RedisService, RedisFeedService, RedisCounterService,RedisPostGuardService],
exports: [RedisService, RedisFeedService, RedisCounterService,RedisPostGuardService],
})
export class RedisModule {}