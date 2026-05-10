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
var PostResolver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
const graphql_1 = require("@nestjs/graphql");
const common_1 = require("@nestjs/common");
const post_service_1 = require("./post.service");
const post_entity_1 = require("./post.entity");
const create_post_input_1 = require("./dto/create-post.input");
const gql_auth_guard_1 = require("../auth/guards/gql-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let PostResolver = PostResolver_1 = class PostResolver {
    posts;
    logger = new common_1.Logger(PostResolver_1.name);
    constructor(posts) {
        this.posts = posts;
    }
    // =====================================================
    // CREATE POST
    // =====================================================
    async createPost(user, data) {
        // ================================================
        // DEBUG USER PAYLOAD
        // ================================================
        this.logger.log(user);
        const userId = user?.userId
            || user?.id
            || user?.sub;
        return this.posts.createPost(userId, data);
    }
    // =====================================================
    // DELETE POST
    // =====================================================
    async deletePost(user, postId) {
        const userId = user?.userId
            || user?.id
            || user?.sub;
        return this.posts.deletePost(postId, userId);
    }
    // =====================================================
    // GET POSTS BY IDS
    // =====================================================
    async getPostsByIds(postIds) {
        return this.posts.getPostsByIds(postIds);
    }
};
exports.PostResolver = PostResolver;
__decorate([
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    (0, graphql_1.Mutation)(() => post_entity_1.PostEntity),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_post_input_1.CreatePostInput]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    (0, graphql_1.Mutation)(() => Boolean),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, graphql_1.Args)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
__decorate([
    (0, graphql_1.Query)(() => [post_entity_1.PostEntity]),
    __param(0, (0, graphql_1.Args)({
        name: 'postIds',
        type: () => [String],
    })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getPostsByIds", null);
exports.PostResolver = PostResolver = PostResolver_1 = __decorate([
    (0, graphql_1.Resolver)(() => post_entity_1.PostEntity),
    __metadata("design:paramtypes", [post_service_1.PostService])
], PostResolver);
//# sourceMappingURL=post.resolver.js.map