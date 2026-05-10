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
var BootstrapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BootstrapService = void 0;
const common_1 = require("@nestjs/common");
const scylla_service_1 = require("../infrastructure/scylladb/scylla.service");
const kafka_service_1 = require("../infrastructure/kafka/kafka.service");
const kafka_bootstrap_1 = require("../infrastructure/kafka/kafka.bootstrap");
const minio_service_1 = require("../infrastructure/minio/minio.service");
// =====================================================
// CONSUMERS
// =====================================================
const feed_consumer_1 = require("../workers/feed/feed.consumer");
const notification_consumer_1 = require("../workers/notification/notification.consumer");
const follow_consumer_1 = require("../workers/follow/follow.consumer");
const like_consumer_1 = require("../workers/like/like.consumer");
const post_consumer_1 = require("../workers/post/post.consumer");
let BootstrapService = BootstrapService_1 = class BootstrapService {
    scylla;
    kafka;
    kafkaBootstrap;
    minio;
    feedConsumer;
    notificationConsumer;
    followConsumer;
    likeConsumer;
    postConsumer;
    logger = new common_1.Logger(BootstrapService_1.name);
    constructor(
    // =====================================================
    // INFRASTRUCTURE
    // =====================================================
    scylla, kafka, kafkaBootstrap, minio, 
    // =====================================================
    // CONSUMERS
    // =====================================================
    feedConsumer, notificationConsumer, followConsumer, likeConsumer, postConsumer) {
        this.scylla = scylla;
        this.kafka = kafka;
        this.kafkaBootstrap = kafkaBootstrap;
        this.minio = minio;
        this.feedConsumer = feedConsumer;
        this.notificationConsumer = notificationConsumer;
        this.followConsumer = followConsumer;
        this.likeConsumer = likeConsumer;
        this.postConsumer = postConsumer;
        console.log('🔥 CONSTRUCTOR');
    }
    // =====================================================
    // APPLICATION BOOTSTRAP
    // =====================================================
    async onApplicationBootstrap() {
        this.logger.log('🚀 Bootstrapping system...');
        try {
            console.log('STEP 1');
            await this.scylla.onModuleInit();
            console.log('STEP 2');
            await this.minio.onModuleInit();
            console.log('STEP 3');
            await this.kafka.onModuleInit();
            console.log('STEP 4');
            await this.kafkaBootstrap.bootstrapTopics();
            console.log('STEP 5');
            await Promise.all([
                this.feedConsumer.start(),
                this.notificationConsumer.start(),
                this.followConsumer.start(),
                this.likeConsumer.start(),
                this.postConsumer.start(),
            ]);
            console.log('STEP 6');
            // ================================================
            // 1. INITIALIZE SCYLLADB
            // ================================================
            await this.scylla.onModuleInit();
            this.logger.log('✅ ScyllaDB initialized');
            // ================================================
            // 2. INITIALIZE MINIO
            // ================================================
            await this.minio.onModuleInit();
            this.logger.log('✅ MinIO initialized');
            // ================================================
            // 3. INITIALIZE KAFKA PRODUCER
            // ================================================
            await this.kafka.onModuleInit();
            this.logger.log('✅ Kafka producer initialized');
            // ================================================
            // 4. CREATE KAFKA TOPICS
            // ================================================
            await this.kafkaBootstrap
                .bootstrapTopics();
            this.logger.log('✅ Kafka topics initialized');
            // ================================================
            // 5. START CONSUMERS
            // ================================================
            await Promise.all([
                this.feedConsumer.start(),
                this.notificationConsumer.start(),
                this.followConsumer.start(),
                this.likeConsumer.start(),
                this.postConsumer.start(),
            ]);
            this.logger.log('✅ Kafka consumers started');
            // ================================================
            // SYSTEM READY
            // ================================================
            this.logger.log('🔥 System bootstrap complete');
        }
        catch (error) {
            this.logger.error('❌ Bootstrap failed', error);
            throw error;
        }
    }
};
exports.BootstrapService = BootstrapService;
exports.BootstrapService = BootstrapService = BootstrapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [scylla_service_1.ScyllaService,
        kafka_service_1.KafkaService,
        kafka_bootstrap_1.KafkaBootstrapService,
        minio_service_1.MinioService,
        feed_consumer_1.FeedConsumer,
        notification_consumer_1.NotificationConsumer,
        follow_consumer_1.FollowConsumer,
        like_consumer_1.LikeConsumer,
        post_consumer_1.PostConsumer])
], BootstrapService);
//# sourceMappingURL=bootstrap.service.js.map