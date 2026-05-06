"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedModule = void 0;
const common_1 = require("@nestjs/common");
const feed_service_1 = require("./feed.service");
const feed_consumer_1 = require("../../workers/feed/feed.consumer");
const kafka_module_1 = require("../../infrastructure/kafka/kafka.module");
const redis_module_1 = require("../../infrastructure/redis/redis.module");
let FeedModule = class FeedModule {
};
exports.FeedModule = FeedModule;
exports.FeedModule = FeedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            kafka_module_1.KafkaModule,
            redis_module_1.RedisModule,
        ],
        providers: [
            feed_service_1.FeedService,
        ],
        controllers: [
            feed_consumer_1.FeedConsumer,
        ],
        exports: [
            feed_service_1.FeedService,
        ],
    })
], FeedModule);
//# sourceMappingURL=feed.module.js.map