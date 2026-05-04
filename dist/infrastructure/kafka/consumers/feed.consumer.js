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
const feed_ranking_util_1 = require("../../../modules/feed/utils/feed-ranking.util");
const feed_constants_1 = require("../../../modules/feed/feed.constants");
let FeedConsumer = FeedConsumer_1 = class FeedConsumer {
    redis;
    redisFeed;
    logger = new common_1.Logger(FeedConsumer_1.name);
    kafka = new kafkajs_1.Kafka({
        clientId: 'social-app',
        brokers: ['localhost:9092'],
    });
    consumer = this.kafka.consumer({
        groupId: 'feed-fanout-group',
    });
    constructor(redis, redisFeed) {
        this.redis = redis;
        this.redisFeed = redisFeed;
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
                    const { postId, userId, createdAt } = event;
                    this.logger.log(`📩 post.created: ${postId}`);
                    // =========================
                    // 1. GET FOLLOWERS FROM REDIS
                    // =========================
                    const followerList = await this.redis
                        .getClient()
                        .smembers(`followers:${userId}`);
                    if (!followerList.length)
                        return;
                    // =========================
                    // 2. CELEBRITY CHECK
                    // =========================
                    const followerCount = followerList.length;
                    if (followerCount > feed_constants_1.CELEBRITY_THRESHOLD) {
                        this.logger.log(`🔥 Celebrity (${followerCount}) → skip fanout`);
                        return;
                    }
                    // =========================
                    // 3. CALCULATE SCORE
                    // =========================
                    const score = (0, feed_ranking_util_1.calculateScore)({
                        createdAt,
                        likes: 0,
                        comments: 0,
                        isFollowingAuthor: true,
                    });
                    // =========================
                    // 4. FANOUT (BATCHED)
                    // =========================
                    const BATCH_SIZE = 500;
                    for (let i = 0; i < followerList.length; i += BATCH_SIZE) {
                        const batch = followerList.slice(i, i + BATCH_SIZE);
                        await Promise.all(batch.map((followerId) => this.redisFeed.addToFeed(followerId, postId, score)));
                    }
                    // =========================
                    // 5. TRIM FEEDS (KEEP LAST N)
                    // =========================
                    for (let i = 0; i < followerList.length; i += BATCH_SIZE) {
                        const batch = followerList.slice(i, i + BATCH_SIZE);
                        await Promise.all(batch.map((followerId) => this.redisFeed.trimFeed(followerId)));
                    }
                    this.logger.log(`⚡ Fanout complete → ${followerCount} users`);
                }
                catch (err) {
                    this.logger.error('Feed consumer error', err);
                }
            },
        });
    }
};
exports.FeedConsumer = FeedConsumer;
exports.FeedConsumer = FeedConsumer = FeedConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        redis_feed_service_1.RedisFeedService])
], FeedConsumer);
//# sourceMappingURL=feed.consumer.js.map