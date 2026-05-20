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
const discovery_feed_service_1 = require("./services/discovery-feed.service");
const feed_ranking_service_1 = require("../ranking/feed-ranking.service");
let FeedService = class FeedService {
    feedQuery;
    discoveryFeed;
    ranking;
    constructor(feedQuery, discoveryFeed, ranking) {
        this.feedQuery = feedQuery;
        this.discoveryFeed = discoveryFeed;
        this.ranking = ranking;
    }
    // =====================================================
    // FANOUT POST
    // =====================================================
    async fanoutPost(payload) {
        const { postId, authorId, followerIds = [], createdAt, locationId, hashtags = [], } = payload;
        // =================================================
        // HOME FEED SCORE
        // =================================================
        const homeFeedScore = this.ranking.calculateScore({
            likes: 0,
            comments: 0,
            reposts: 0,
            bookmarks: 0,
            views: 0,
            dwellTimeMs: 0,
            completionRate: 0,
            createdAt: new Date(),
            isFollowingAuthor: true,
            isLocalAuthor: false,
        });
        // =================================================
        // USER FEED SCORE
        // =================================================
        // Profile feeds are mostly chronological
        // =================================================
        const userFeedScore = Date.now();
        // =================================================
        // LOCATION FEED SCORE
        // =================================================
        const locationFeedScore = this.ranking.calculateScore({
            likes: 0,
            comments: 0,
            reposts: 0,
            bookmarks: 0,
            views: 0,
            dwellTimeMs: 0,
            completionRate: 0,
            createdAt: new Date(),
            isFollowingAuthor: false,
            isLocalAuthor: true,
        });
        // =================================================
        // HOME FEED
        // =================================================
        if (followerIds.length) {
            await Promise.all(followerIds.map(async (followerId) => {
                await this.feedQuery
                    .insertHomeFeed({
                    userId: followerId,
                    postId,
                    authorId,
                    createdAt,
                    score: homeFeedScore,
                });
            }));
        }
        // =================================================
        // USER FEED
        // =================================================
        await this.feedQuery
            .insertUserFeed({
            userId: authorId,
            postId,
            authorId,
            createdAt,
            score: userFeedScore,
        });
        // =================================================
        // LOCATION FEED
        // =================================================
        if (locationId) {
            await this.feedQuery
                .insertLocationFeed({
                locationId,
                postId,
                authorId,
                createdAt,
                score: locationFeedScore,
            });
        }
        // =================================================
        // HASHTAG FEED SCORE
        // =================================================
        const hashtagFeedScore = this.ranking.calculateScore({
            likes: 0,
            comments: 0,
            reposts: 0,
            bookmarks: 0,
            views: 0,
            dwellTimeMs: 0,
            completionRate: 0,
            createdAt: new Date(),
            isFollowingAuthor: false,
            isLocalAuthor: false,
        });
        console.log('GENERATED HASHTAG SCORE', hashtagFeedScore);
        if (hashtags.length) {
            await Promise.all(hashtags.map(async (hashtag) => {
                await this.feedQuery
                    .insertHashtagFeed({
                    hashtag,
                    postId,
                    authorId,
                    createdAt,
                    score: hashtagFeedScore,
                });
            }));
        }
    }
    // =====================================================
    // GET HOME FEED
    // =====================================================
    async getHomeFeed(params) {
        return this.feedQuery
            .getHomeFeed(params);
    }
    // =====================================================
    // GET USER FEED
    // =====================================================
    async getUserFeed(params) {
        return this.feedQuery
            .getUserFeed(params);
    }
    // =====================================================
    // GET LOCATION FEED
    // =====================================================
    async getLocationFeed(params) {
        return this.feedQuery
            .getLocationFeed(params);
    }
    // =====================================================
    // GET HASHTAG FEED
    // =====================================================
    async getHashtagFeed(params) {
        return this.feedQuery
            .getHashtagFeed(params);
    }
    // =====================================================
    // DISCOVERY FEED
    // =====================================================
    async getDiscoveryFeed(params) {
        return this.discoveryFeed
            .getDiscoveryFeed(params);
    }
};
exports.FeedService = FeedService;
exports.FeedService = FeedService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [feed_query_service_1.FeedQueryService,
        discovery_feed_service_1.DiscoveryFeedService,
        feed_ranking_service_1.FeedRankingService])
], FeedService);
//# sourceMappingURL=feed.service.js.map