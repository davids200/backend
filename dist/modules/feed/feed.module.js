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
const feed_resolver_1 = require("./feed.resolver");
const scylla_service_1 = require("../../infrastructure/scylladb/scylla.service");
const post_module_1 = require("../post/post.module");
const redis_module_1 = require("../../infrastructure/redis/redis.module");
const scylla_module_1 = require("../../infrastructure/scylladb/scylla.module");
let FeedModule = class FeedModule {
};
exports.FeedModule = FeedModule;
exports.FeedModule = FeedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            post_module_1.PostModule,
            redis_module_1.RedisModule,
            scylla_module_1.ScyllaModule
        ],
        providers: [feed_service_1.FeedService, feed_resolver_1.FeedResolver, scylla_service_1.ScyllaService],
        exports: [
            feed_service_1.FeedService
        ]
    })
], FeedModule);
//# sourceMappingURL=feed.module.js.map