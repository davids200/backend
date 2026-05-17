"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("./redis.service");
const redis_feed_service_1 = require("./feed/redis.feed.service");
const session_cache_service_1 = require("../../modules/auth/services/session-cache.service");
const redis_post_guard_service_1 = require("./counters/post/redis-post-guard.service");
const redis_bookmark_counter_1 = require("./counters/bookmark/redis.bookmark.counter");
const redis_post_counter_service_1 = require("./counters/post/redis.post.counter.service");
const redis_comment_counter_service_1 = require("./counters/comment/redis.comment.counter.service");
const redis_engagement_counter_service_1 = require("./counters/engagement/redis.engagement.counter.service");
const redis_like_counter_service_1 = require("./counters/like/redis.like.counter.service");
const redis_repost_counter_service_1 = require("./counters/repost/redis.repost.counter.service");
const redis_view_counter_service_1 = require("./counters/view/redis.view.counter.service");
let RedisModule = class RedisModule {
};
exports.RedisModule = RedisModule;
exports.RedisModule = RedisModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            redis_service_1.RedisService,
            redis_feed_service_1.RedisFeedService,
            redis_post_guard_service_1.RedisPostGuardService,
            session_cache_service_1.SessionCacheService,
            redis_bookmark_counter_1.RedisBookmarkCounterService,
            redis_post_counter_service_1.RedisPostCounterService,
            redis_comment_counter_service_1.RedisCommentCounterService,
            redis_engagement_counter_service_1.RedisEngagementCounterService,
            redis_like_counter_service_1.RedisLikeCounterService,
            redis_repost_counter_service_1.RedisRepostCounterService,
            redis_view_counter_service_1.RedisViewCounterService,
        ],
        exports: [
            redis_service_1.RedisService,
            redis_feed_service_1.RedisFeedService,
            redis_post_guard_service_1.RedisPostGuardService,
            session_cache_service_1.SessionCacheService,
            redis_bookmark_counter_1.RedisBookmarkCounterService,
            redis_post_counter_service_1.RedisPostCounterService,
            redis_comment_counter_service_1.RedisCommentCounterService,
            redis_engagement_counter_service_1.RedisEngagementCounterService,
            redis_like_counter_service_1.RedisLikeCounterService,
            redis_repost_counter_service_1.RedisRepostCounterService,
            redis_view_counter_service_1.RedisViewCounterService,
        ],
    })
], RedisModule);
//# sourceMappingURL=redis.module.js.map