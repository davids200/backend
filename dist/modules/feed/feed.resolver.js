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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const feed_service_1 = require("./feed.service");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const feed_response_1 = require("./dto/feed.response");
// import { GqlAuthGuard } from '../auth/gql-auth.guard';
// import { CurrentUser } from '../auth/current-user.decorator';
let FeedResolver = class FeedResolver {
    feedService;
    constructor(feedService) {
        this.feedService = feedService;
    }
    async getFeed(user, limit, cursor) {
        return this.feedService.getFeed(user.userId, limit, cursor);
    }
};
exports.FeedResolver = FeedResolver;
__decorate([
    (0, graphql_1.Query)(() => feed_response_1.FeedResponse),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('limit', { nullable: true })),
    __param(2, (0, graphql_1.Args)('cursor', { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], FeedResolver.prototype, "getFeed", null);
exports.FeedResolver = FeedResolver = __decorate([
    (0, graphql_1.Resolver)(),
    __metadata("design:paramtypes", [feed_service_1.FeedService])
], FeedResolver);
//# sourceMappingURL=feed.resolver.js.map