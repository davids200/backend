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
exports.PostResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const post_service_1 = require("./post.service");
const create_post_input_1 = require("./dto/create-post.input");
const post_model_1 = require("./post.model");
const feed_service_1 = require("../feed/feed.service");
const feed_response_1 = require("../feed/dto/feed.response");
const user_entity_1 = require("../user/entities/user.entity");
const gql_auth_guard_1 = require("../auth/guards/gql-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let PostResolver = class PostResolver {
    postService;
    feedService;
    constructor(postService, feedService) {
        this.postService = postService;
        this.feedService = feedService;
    }
    // =====================================================
    // GET USER FEED
    // =====================================================
    async getFeed(user, limit, cursor) {
        return this.feedService.getFeed(user, limit, cursor);
    }
    // =====================================================
    // CREATE POST
    // =====================================================
    async createPost(user, data) {
        return this.postService.createPost(user.id, data);
    }
};
exports.PostResolver = PostResolver;
__decorate([
    (0, graphql_1.Query)(() => feed_response_1.FeedResponse),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('limit', {
        nullable: true,
        defaultValue: 20,
    })),
    __param(2, (0, graphql_1.Args)('cursor', {
        nullable: true,
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.UserEntity, Number, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getFeed", null);
__decorate([
    (0, graphql_1.Mutation)(() => post_model_1.PostModel),
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.UserEntity,
        create_post_input_1.CreatePostInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
exports.PostResolver = PostResolver = __decorate([
    (0, graphql_1.Resolver)(() => post_model_1.PostModel),
    __metadata("design:paramtypes", [post_service_1.PostService,
        feed_service_1.FeedService])
], PostResolver);
//# sourceMappingURL=post.resolver.js.map