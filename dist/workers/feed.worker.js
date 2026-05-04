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
var FeedWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedWorker = void 0;
const common_1 = require("@nestjs/common");
const kafkajs_1 = require("kafkajs");
const postgres_service_1 = require("../infrastructure/postgresql/postgres.service");
const redis_feed_service_1 = require("../infrastructure/redis/feed/redis.feed.service");
const feed_constants_1 = require("../modules/feed/feed.constants");
let FeedWorker = FeedWorker_1 = class FeedWorker {
    postgres;
    redisFeed;
    logger = new common_1.Logger(FeedWorker_1.name);
    kafka = new kafkajs_1.Kafka({
        clientId: 'feed-worker',
        brokers: ['localhost:9092'],
    });
    consumer = this.kafka.consumer({
        groupId: 'feed-group',
    });
    constructor(postgres, redisFeed) {
        this.postgres = postgres;
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
        this.logger.log('🚀 Feed Worker Started');
        //runs continuously
        //executes this block for every Kafka message
        await this.consumer.run({
            eachMessage: async ({ message }) => {
                try {
                    if (!message.value)
                        return;
                    const event = JSON.parse(message.value.toString());
                    const { postId, userId } = event;
                    // ============== GET FOLLOWERS=========================
                    const followers = await this.postgres.query(`SELECT follower_id FROM follows WHERE following_id = $1`, [userId]);
                    //////////////////COUNT FOLLOWERS SO THAT YOU DETECT BIG ACCOUNTS//////////
                    const followerCount = followers?.rowCount ?? 0;
                    const isCelebrity = followerCount > feed_constants_1.CELEBRITY_THRESHOLD; /// isCelebrity/big account
                    if (isCelebrity) {
                        this.logger.log(`🔥 Celebrity detected: ${userId}`);
                        // ❌ DO NOT fanout
                        return;
                    }
                    const followerList = followers.rows;
                    if (!followerList.length)
                        return;
                    // =========================
                    // SCORE (simple for now)
                    // =========================
                    const score = Date.now();
                    // =========================
                    // PUSH TO REDIS FEEDS
                    // =========================
                    //listens for new posts
                    //ignores old events
                    const tasks = followerList.map((f) => this.redisFeed.addToFeed(f.follower_id, postId, score));
                    // executes all writes in parallel
                    await Promise.all(tasks);
                    // =========================
                    // TRIM FEEDS (IMPORTANT)
                    // =========================
                    //keeps only latest 500 posts,deletes older ones
                    await Promise.all(followerList.map((f) => this.redisFeed.trimFeed(f.follower_id)));
                    this.logger.log(`Feed updated for ${followerList.length} users`);
                }
                catch (err) {
                    this.logger.error('Feed Worker Error', err);
                }
            },
        });
    }
};
exports.FeedWorker = FeedWorker;
exports.FeedWorker = FeedWorker = FeedWorker_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [postgres_service_1.PostgresService,
        redis_feed_service_1.RedisFeedService])
], FeedWorker);
//# sourceMappingURL=feed.worker.js.map