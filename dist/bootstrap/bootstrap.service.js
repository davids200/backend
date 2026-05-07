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
const minio_service_1 = require("../infrastructure/minio/minio.service");
const feed_consumer_1 = require("../workers/feed/feed.consumer");
const notification_consumer_1 = require("../workers/notification/notification.consumer");
let BootstrapService = BootstrapService_1 = class BootstrapService {
    scylla;
    kafka;
    minio;
    feedConsumer;
    notificationConsumer;
    logger = new common_1.Logger(BootstrapService_1.name);
    constructor(scylla, kafka, minio, feedConsumer, notificationConsumer) {
        this.scylla = scylla;
        this.kafka = kafka;
        this.minio = minio;
        this.feedConsumer = feedConsumer;
        this.notificationConsumer = notificationConsumer;
    }
    async onApplicationBootstrap() {
        // this.logger.log('🚀 Bootstrapping system...');
        try {
            // 1. Init ScyllaDB schema
            await this.scylla.onModuleInit();
            // this.logger.log('✔ ScyllaDB initialized');
            // 2. Init MinIO buckets
            await this.minio.onModuleInit();
            // this.logger.log('✔ MinIO initialized');
            // 3. Init Kafka producer
            await this.kafka.onModuleInit();
            // this.logger.log('✔ Kafka producer initialized');
            // 4. Start consumers explicitly (IMPORTANT)
            // await this.feedConsumer.onModuleInit();
            // this.logger.log('✔ Feed consumer started');
            await this.notificationConsumer.onModuleInit();
            //  this.logger.log('✔ Notification consumer started');
            //  this.logger.log('🔥 Bootstrap complete — system is live');
        }
        catch (error) {
            // this.logger.error('❌ Bootstrap failed', error);
            throw error;
        }
    }
};
exports.BootstrapService = BootstrapService;
exports.BootstrapService = BootstrapService = BootstrapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [scylla_service_1.ScyllaService,
        kafka_service_1.KafkaService,
        minio_service_1.MinioService,
        feed_consumer_1.FeedConsumer,
        notification_consumer_1.NotificationConsumer])
], BootstrapService);
//# sourceMappingURL=bootstrap.service.js.map