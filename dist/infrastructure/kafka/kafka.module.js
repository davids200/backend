"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaModule = void 0;
const common_1 = require("@nestjs/common");
const kafka_service_1 = require("./kafka.service");
// producers
const post_producer_1 = require("./producers/post.producer");
const follow_producer_1 = require("./producers/follow.producer");
const notification_producer_1 = require("./producers/notification.producer");
// consumers
const feed_consumer_1 = require("./consumers/feed.consumer");
// workers
const scylla_module_1 = require("../scylladb/scylla.module");
const postgres_module_1 = require("../postgresql/postgres.module");
const redis_module_1 = require("../redis/redis.module");
const feed_worker_1 = require("../../workers/feed/feed.worker");
const location_producer_1 = require("./location.producer");
const location_feed_repo_1 = require("../scylladb/location.feed.repo");
const location_module_1 = require("../../modules/location/location.module");
let KafkaModule = class KafkaModule {
};
exports.KafkaModule = KafkaModule;
exports.KafkaModule = KafkaModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            scylla_module_1.ScyllaModule,
            postgres_module_1.PostgresModule,
            redis_module_1.RedisModule,
            location_module_1.LocationModule
        ],
        providers: [
            kafka_service_1.KafkaService,
            location_producer_1.LocationProducer,
            // producers
            post_producer_1.PostProducer,
            follow_producer_1.FollowProducer,
            notification_producer_1.NotificationProducer,
            location_feed_repo_1.LocationFeedRepository,
            // consumers
            feed_consumer_1.FeedConsumer,
            // NotificationConsumer,
            // workers
            feed_worker_1.FeedWorker,
        ],
        exports: [
            kafka_service_1.KafkaService,
            post_producer_1.PostProducer,
            follow_producer_1.FollowProducer,
            notification_producer_1.NotificationProducer,
            location_producer_1.LocationProducer
        ],
    })
], KafkaModule);
//# sourceMappingURL=kafka.module.js.map