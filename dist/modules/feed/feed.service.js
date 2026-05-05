"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedService = void 0;
const common_1 = require("@nestjs/common");
const redis_feed_service_1 = require("../../infrastructure/redis/feed/redis.feed.service");
const post_service_1 = require("../post/post.service");
const redis_counter_service_1 = require("../../infrastructure/redis/counters/redis.counter.service");
let FeedService = class FeedService {
    redisFeed;
    postService;
    redisCounter;
    constructor(redisFeed, postService, redisCounter) {
        this.redisFeed = redisFeed;
        this.postService = postService;
        this.redisCounter = redisCounter;
    }
    async getFeed(userId, limit = 20, offset = 0) {
        const postIds = await this.redisFeed.getFeed(userId, limit, offset);
        if (!postIds.length) {
            return { data: [], nextCursor: null };
        }
        const [posts, counters] = await Promise.all([
            this.postService.getPostsByIds(postIds),
            this.redisCounter.getBulkCounts(postIds),
        ]);
        const postMap = new Map(posts.map((p) => [p.id, p]));
        const feed = postIds
            .map((postId) => {
            const post = postMap.get(postId);
            if (!post)
                return null;
            const counter = counters[postId] || {
                likes: 0,
                comments: 0,
            };
            return {
                ...post,
                likes: counter.likes,
                comments: counter.comments,
            };
        })
            .filter(Boolean);
        return {
            data: feed,
            nextCursor: postIds.length === limit ? offset + limit : null,
        };
    }
};
exports.FeedService = FeedService;
exports.FeedService = FeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_feed_service_1.RedisFeedService,
        post_service_1.PostService,
        redis_counter_service_1.RedisCounterService])
], FeedService);
//# sourceMappingURL=feed.service.js.map