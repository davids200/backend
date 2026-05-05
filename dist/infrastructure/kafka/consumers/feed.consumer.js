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
var FeedConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedConsumer = void 0;
const common_1 = require("@nestjs/common");
const kafkajs_1 = require("kafkajs");
const redis_service_1 = require("../../redis/redis.service");
const redis_feed_service_1 = require("../../redis/feed/redis.feed.service");
const location_feed_repo_1 = require("../../scylladb/location.feed.repo");
const feed_ranking_util_1 = require("../../../modules/feed/utils/feed-ranking.util");
const feed_constants_1 = require("../../../modules/feed/feed.constants");
const location_service_1 = require("../../../modules/location/location.service");
let FeedConsumer = FeedConsumer_1 = class FeedConsumer {
    redis;
    redisFeed;
    locationFeedRepo;
    locationService;
    logger = new common_1.Logger(FeedConsumer_1.name);
    kafka = new kafkajs_1.Kafka({
        clientId: 'social-app',
        brokers: ['localhost:9092'],
    });
    consumer = this.kafka.consumer({
        groupId: 'feed-fanout-group',
    });
    constructor(redis, redisFeed, locationFeedRepo, locationService) {
        this.redis = redis;
        this.redisFeed = redisFeed;
        this.locationFeedRepo = locationFeedRepo;
        this.locationService = locationService;
    }
    async onModuleInit() {
        await this.start();
    }
    async start() {
        await this.consumer.connect();
        await this.consumer.subscribe({
            topic: 'post.created',
            fromBeginning: false,
        });
        this.logger.log('🚀 Feed Consumer started');
        await this.consumer.run({
            eachMessage: async ({ message }) => {
                if (!message.value)
                    return;
                try {
                    const event = JSON.parse(message.value.toString());
                    const { postId, userId, createdAt, locationId } = event;
                    // 1. SCORE
                    const score = (0, feed_ranking_util_1.calculateScore)({
                        createdAt,
                        likes: 0,
                        comments: 0,
                        isFollowingAuthor: true,
                    });
                    // 2. FOLLOWERS
                    const followers = await this.redis
                        .getClient()
                        .smembers(`followers:${userId}`);
                    // 3. FANOUT (NON-CELEBRITY)
                    if (followers.length <= feed_constants_1.CELEBRITY_THRESHOLD) {
                        const BATCH = 500;
                        for (let i = 0; i < followers.length; i += BATCH) {
                            const batch = followers.slice(i, i + BATCH);
                            await Promise.all(batch.map((followerId) => this.redisFeed.addToFeed(followerId, postId, score)));
                        }
                    }
                    // 4. LOCATION FEED
                    if (locationId) {
                        const hierarchy = await this.locationService.getLocationHierarchy(locationId);
                        await Promise.all(hierarchy.map((loc) => this.locationFeedRepo.insertPost({
                            locationId: loc.id,
                            postId,
                            authorId: userId,
                            createdAt: new Date(createdAt),
                        })));
                    }
                    // 5. GLOBAL
                    await this.locationFeedRepo.insertGlobalPost({
                        postId,
                        authorId: userId,
                        createdAt: new Date(createdAt),
                    });
                    this.logger.log(`✅ Feed processed: ${postId}`);
                }
                catch (err) {
                    this.logger.error('Feed error', err);
                }
            },
        });
    }
};
exports.FeedConsumer = FeedConsumer;
exports.FeedConsumer = FeedConsumer = FeedConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        redis_feed_service_1.RedisFeedService,
        location_feed_repo_1.LocationFeedRepository,
        location_service_1.LocationService])
], FeedConsumer);
//# sourceMappingURL=feed.consumer.js.map