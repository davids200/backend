"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModule = void 0;
const common_1 = require("@nestjs/common");
const post_service_1 = require("./post.service");
const post_resolver_1 = require("./post.resolver");
const minio_service_1 = require("../../infrastructure/minio/minio.service");
const kafka_service_1 = require("../../infrastructure/kafka/kafka.service");
const post_producer_1 = require("../../infrastructure/kafka/producers/post.producer");
const kafka_module_1 = require("../../infrastructure/kafka/kafka.module");
const typeorm_1 = require("@nestjs/typeorm");
const post_entity_1 = require("./post.entity");
const feed_service_1 = require("../feed/feed.service");
let PostModule = class PostModule {
};
exports.PostModule = PostModule;
exports.PostModule = PostModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([post_entity_1.PostEntity]),
            kafka_module_1.KafkaModule,
        ],
        providers: [
            post_service_1.PostService,
            post_resolver_1.PostResolver,
            minio_service_1.MinioService,
            kafka_service_1.KafkaService,
            post_producer_1.PostProducer,
            feed_service_1.FeedService
        ],
        exports: [
            post_service_1.PostService,
            kafka_module_1.KafkaModule,
        ]
    })
], PostModule);
//# sourceMappingURL=post.module.js.map