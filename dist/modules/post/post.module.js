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
const typeorm_1 = require("@nestjs/typeorm");
const post_entity_1 = require("./post.entity");
const post_service_1 = require("./post.service");
const post_producer_1 = require("./post.producer");
const post_resolver_1 = require("./post.resolver");
const feed_module_1 = require("../feed/feed.module");
const notification_module_1 = require("../notification/notification.module");
const kafka_module_1 = require("../../infrastructure/kafka/kafka.module");
const location_module_1 = require("../location/location.module");
let PostModule = class PostModule {
};
exports.PostModule = PostModule;
exports.PostModule = PostModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                post_entity_1.PostEntity,
            ]),
            (0, common_1.forwardRef)(() => feed_module_1.FeedModule),
            notification_module_1.NotificationModule,
            kafka_module_1.KafkaModule,
            location_module_1.LocationModule
        ],
        providers: [
            post_service_1.PostService,
            post_producer_1.PostProducer,
            post_resolver_1.PostResolver,
        ],
        exports: [
            post_service_1.PostService,
        ],
    })
], PostModule);
//# sourceMappingURL=post.module.js.map