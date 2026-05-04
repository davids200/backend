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
const post_service_1 = require("../post/post.service");
const redis_feed_service_1 = require("../../infrastructure/redis/feed/redis.feed.service");
const redis_counter_service_1 = require("../../infrastructure/redis/counters/redis.counter.service");
const feed_ranking_util_1 = require("./utils/feed-ranking.util");
let FeedService = class FeedService {
    postService;
    redisFeed;
    redisCounter;
    constructor(postService, redisFeed, redisCounter) {
        this.postService = postService;
        this.redisFeed = redisFeed;
        this.redisCounter = redisCounter;
    }
    async getFeed(userId, limit = 20, offset = 0) {
        // =========================
        // 1. REDIS (FAST)
        // =========================
        const postIds = await this.redisFeed.getFeed(userId, limit, offset);
        if (!postIds.length) {
            return { data: [], nextCursor: null };
        }
        // =========================
        // 2. POSTGRES
        // =========================
        const posts = await this.postService.getPostsByIds(postIds);
        const postMap = new Map(posts.map((p) => [p.id, p]));
        // =========================
        // 3. REDIS COUNTERS
        // =========================
        const counters = await this.redisCounter.getBulkCounts(postIds);
        // =========================
        // 4. MERGE (SAFE)
        // =========================
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
                postId,
                authorId: post.authorId,
                createdAt: post.createdAt, // ✅ guaranteed
                content: post.content,
                media: post.media,
                locationId: post.locationId,
                likes: counter.likes,
                comments: counter.comments,
                isFollowingAuthor: true,
            };
        })
            .filter((p) => !!p);
        // =========================
        // 5. RANKING
        // =========================
        const ranked = feed.sort((a, b) => (0, feed_ranking_util_1.calculateScore)(b) - (0, feed_ranking_util_1.calculateScore)(a));
        // =========================
        // 6. PAGINATION
        // =========================
        const nextCursor = ranked.length === limit ? offset + limit : null;
        return {
            data: ranked,
            nextCursor,
        };
    }
};
exports.FeedService = FeedService;
exports.FeedService = FeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [post_service_1.PostService,
        redis_feed_service_1.RedisFeedService,
        redis_counter_service_1.RedisCounterService])
], FeedService);
//# sourceMappingURL=feed.service.js.map