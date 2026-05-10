import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisFeedService } from './feed/redis.feed.service';
import { RedisCounterService } from './counters/redis.counter.service';
import { RedisPostGuardService } from './post/redis-post-guard.service';
import { SessionCacheService } from '../../modules/auth/services/session-cache.service';


@Global()
@Module({
 providers: [
    RedisService, 
    RedisFeedService, 
    RedisCounterService,
    RedisPostGuardService,
    SessionCacheService
],
exports: [
    RedisService, 
    RedisFeedService, 
    RedisCounterService,
    RedisPostGuardService,
SessionCacheService 
],
})
export class RedisModule {}