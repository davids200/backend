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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const feed_service_1 = require("./feed.service");
const feed_response_1 = require("./dto/feed.response");
const gql_auth_guard_1 = require("../auth/guards/gql-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let FeedResolver = class FeedResolver {
    feedService;
    constructor(feedService) {
        this.feedService = feedService;
    }
    // =====================================================
    // HOME FEED
    // =====================================================
    async homeFeed(user, limit, cursor) {
        return this.feedService
            .getHomeFeed({
            userId: user.id,
            limit,
            cursor,
        });
    }
    // =====================================================
    // USER PROFILE FEED
    // =====================================================
    async userFeed(authorId, limit, cursor) {
        return this.feedService
            .getUserFeed({
            authorId,
            limit,
            cursor,
        });
    }
    // =====================================================
    // LOCATION FEED
    // =====================================================
    async locationFeed(locationId, limit, cursor) {
        return this.feedService
            .getLocationFeed({
            locationId,
            limit,
            cursor,
        });
    }
    // =====================================================
    // HASHTAG FEED
    // =====================================================
    async hashtagFeed(hashtag, limit, cursor) {
        return this.feedService
            .getHashtagFeed({
            hashtag,
            limit,
            cursor,
        });
    }
    // =====================================================
    // DISCOVERY FEED
    // =====================================================
    async discoveryFeed(user, locationId, hashtags, limit, cursor) {
        return this.feedService
            .getDiscoveryFeed({
            userId: user.id,
            locationId,
            hashtags,
            limit,
            cursor,
        });
    }
};
exports.FeedResolver = FeedResolver;
__decorate([
    (0, graphql_1.Query)(() => feed_response_1.FeedResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('limit', {
        nullable: true,
        defaultValue: 20,
    })),
    __param(2, (0, graphql_1.Args)('cursor', {
        nullable: true,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Date]),
    __metadata("design:returntype", Promise)
], FeedResolver.prototype, "homeFeed", null);
__decorate([
    (0, graphql_1.Query)(() => feed_response_1.FeedResponse),
    __param(0, (0, graphql_1.Args)('authorId')),
    __param(1, (0, graphql_1.Args)('limit', {
        nullable: true,
        defaultValue: 20,
    })),
    __param(2, (0, graphql_1.Args)('cursor', {
        nullable: true,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Date]),
    __metadata("design:returntype", Promise)
], FeedResolver.prototype, "userFeed", null);
__decorate([
    (0, graphql_1.Query)(() => feed_response_1.FeedResponse),
    __param(0, (0, graphql_1.Args)('locationId')),
    __param(1, (0, graphql_1.Args)('limit', {
        nullable: true,
        defaultValue: 20,
    })),
    __param(2, (0, graphql_1.Args)('cursor', {
        nullable: true,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Date]),
    __metadata("design:returntype", Promise)
], FeedResolver.prototype, "locationFeed", null);
__decorate([
    (0, graphql_1.Query)(() => feed_response_1.FeedResponse),
    __param(0, (0, graphql_1.Args)('hashtag')),
    __param(1, (0, graphql_1.Args)('limit', {
        nullable: true,
        defaultValue: 20,
    })),
    __param(2, (0, graphql_1.Args)('cursor', {
        nullable: true,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Date]),
    __metadata("design:returntype", Promise)
], FeedResolver.prototype, "hashtagFeed", null);
__decorate([
    (0, graphql_1.Query)(() => feed_response_1.FeedResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('locationId', {
        nullable: true,
    })),
    __param(2, (0, graphql_1.Args)('hashtags', {
        nullable: true,
        type: () => [String],
    })),
    __param(3, (0, graphql_1.Args)('limit', {
        nullable: true,
        defaultValue: 20,
    })),
    __param(4, (0, graphql_1.Args)('cursor', {
        nullable: true,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Array, Number, Date]),
    __metadata("design:returntype", Promise)
], FeedResolver.prototype, "discoveryFeed", null);
exports.FeedResolver = FeedResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [feed_service_1.FeedService])
], FeedResolver);
//# sourceMappingURL=feed.resolver.js.map