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
var FeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedService = void 0;
const common_1 = require("@nestjs/common");
const redis_feed_service_1 = require("../../infrastructure/redis/feed/redis.feed.service");
let FeedService = FeedService_1 = class FeedService {
    redisFeed;
    logger = new common_1.Logger(FeedService_1.name);
    constructor(redisFeed) {
        this.redisFeed = redisFeed;
    }
    // =====================================================
    // PROCESS POST EVENT
    // =====================================================
    async processPost(params) {
        const { postId, userId, locationId, createdAt, } = params;
        // this.logger.log(
        //   `Processing post: ${postId}`,
        // );
        // ================================================
        // PLACEHOLDER
        // Feed fanout logic handled here
        // ================================================
        return true;
    }
    // =====================================================
    // GET USER FEED
    // =====================================================
    async getFeed(user, limit = 20, cursor) {
        // ================================================
        // FOLLOWING FEED
        // ================================================
        const followingFeed = await this.redisFeed
            .getFeedWithCursor(user.id, limit, cursor);
        // ================================================
        // GLOBAL TRENDING
        // ================================================
        const globalTrending = await this.redisFeed
            .getGlobalTrending(limit);
        // ================================================
        // LOCATION TRENDING
        // ================================================
        let localTrending = [];
        if (user.locationId) {
            localTrending =
                await this.redisFeed
                    .getLocationTrending(user.locationId, limit);
        }
        // ================================================
        // MERGE FEEDS
        // ================================================
        const merged = [
            ...followingFeed,
            ...globalTrending,
            ...localTrending,
        ];
        // ================================================
        // REMOVE DUPLICATES
        // ================================================
        const uniquePosts = [
            ...new Set(merged),
        ];
        // ================================================
        // NEXT CURSOR
        // ================================================
        const nextCursor = (cursor || 0) + limit;
        return {
            posts: uniquePosts,
            nextCursor,
        };
    }
};
exports.FeedService = FeedService;
exports.FeedService = FeedService = FeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_feed_service_1.RedisFeedService])
], FeedService);
//# sourceMappingURL=feed.service.js.map