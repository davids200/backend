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
const feed_query_service_1 = require("./services/feed-query.service");
let FeedService = class FeedService {
    queryService;
    constructor(queryService) {
        this.queryService = queryService;
    }
    // =====================================================
    // HOME FEED
    // =====================================================
    async getHomeFeed(params) {
        return this.queryService
            .getHomeFeed(params);
    }
    // =====================================================
    // USER FEED
    // =====================================================
    async getUserFeed(params) {
        const bucketDate = (params.cursor ||
            new Date())
            .toISOString()
            .split('T')[0];
        return this.queryService
            .getUserFeed({
            ...params,
            bucketDate,
        });
    }
    // =====================================================
    // LOCATION FEED
    // =====================================================
    async getLocationFeed(params) {
        return this.queryService
            .getLocationFeed(params);
    }
    // =====================================================
    // HASHTAG FEED
    // =====================================================
    async getHashtagFeed(params) {
        return this.queryService
            .getHashtagFeed(params);
    }
    // =====================================================
    // DISCOVERY FEED
    // =====================================================
    async getDiscoveryFeed(params) {
        return this.queryService
            .getDiscoveryFeed(params);
    }
};
exports.FeedService = FeedService;
exports.FeedService = FeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [feed_query_service_1.FeedQueryService])
], FeedService);
//# sourceMappingURL=feed.service.js.map