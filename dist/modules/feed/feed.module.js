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
const post_module_1 = require("../post/post.module");
// repositories
const home_feed_repo_1 = require("../../infrastructure/scylladb/repositories/feed/home.feed.repo");
const user_feed_repo_1 = require("../../infrastructure/scylladb/repositories/feed/user.feed.repo");
const location_feed_repo_1 = require("../../infrastructure/scylladb/repositories/feed/location.feed.repo");
const hashtag_feed_repo_1 = require("../../infrastructure/scylladb/repositories/feed/hashtag.feed.repo");
// services
const feed_query_service_1 = require("./services/feed-query.service");
const feed_hydration_service_1 = require("./services/feed-hydration.service");
const discovery_feed_service_1 = require("./services/discovery-feed.service");
const scylla_module_1 = require("../../infrastructure/scylladb/scylla.module");
const feed_producer_1 = require("./feed.producer");
let FeedModule = class FeedModule {
};
exports.FeedModule = FeedModule;
exports.FeedModule = FeedModule = __decorate([
    (0, common_1.Module)({
        imports: [
            (0, common_1.forwardRef)(() => post_module_1.PostModule),
            scylla_module_1.ScyllaModule,
        ],
        providers: [
            // ============================================
            // MAIN
            // ============================================
            feed_service_1.FeedService,
            feed_resolver_1.FeedResolver,
            // ============================================
            // INTERNAL SERVICES
            // ============================================
            feed_query_service_1.FeedQueryService,
            feed_hydration_service_1.FeedHydrationService,
            discovery_feed_service_1.DiscoveryFeedService,
            // ============================================
            // PRODUCERS
            // ============================================
            feed_producer_1.FeedProducer,
            // ============================================
            // REPOSITORIES
            // ============================================
            home_feed_repo_1.HomeFeedRepository,
            user_feed_repo_1.UserFeedRepository,
            location_feed_repo_1.LocationFeedRepository,
            hashtag_feed_repo_1.HashtagFeedRepository,
        ],
        exports: [
            feed_service_1.FeedService,
            location_feed_repo_1.LocationFeedRepository,
            // IMPORTANT
            feed_producer_1.FeedProducer,
        ],
    })
], FeedModule);
//# sourceMappingURL=feed.module.js.map