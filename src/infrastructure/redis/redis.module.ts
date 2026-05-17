import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisFeedService } from './feed/redis.feed.service'; 
import { SessionCacheService } from '../../modules/auth/services/session-cache.service';
import { RedisPostGuardService } from './counters/post/redis-post-guard.service';
import { RedisBookmarkCounterService } from './counters/bookmark/redis.bookmark.counter';
import { RedisPostCounterService } from './counters/post/redis.post.counter.service';
import { RedisCommentCounterService } from './counters/comment/redis.comment.counter.service';
import { RedisEngagementCounterService } from './counters/engagement/redis.engagement.counter.service';
import { RedisLikeCounterService } from './counters/like/redis.like.counter.service';
import { RedisRepostCounterService } from './counters/repost/redis.repost.counter.service';
import { RedisViewCounterService } from './counters/view/redis.view.counter.service';


@Global()
@Module({
 providers: [
    RedisService, 
    RedisFeedService,  
    RedisPostGuardService,
    SessionCacheService,

    RedisBookmarkCounterService,
    RedisPostCounterService,
    RedisCommentCounterService,
    RedisEngagementCounterService,
    RedisLikeCounterService,
    RedisRepostCounterService,
    RedisViewCounterService,
],
exports: [
RedisService, 
RedisFeedService,     
RedisPostGuardService,
SessionCacheService,

RedisBookmarkCounterService,
    RedisPostCounterService,
    RedisCommentCounterService,
    RedisEngagementCounterService,
    RedisLikeCounterService,
    RedisRepostCounterService,
    RedisViewCounterService,
],
})
export class RedisModule {}