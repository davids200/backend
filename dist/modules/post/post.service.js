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
exports.PostService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const post_entity_1 = require("./post.entity");
const post_producer_1 = require("./post.producer");
const location_service_1 = require("../location/location.service");
let PostService = class PostService {
    repo;
    producer;
    locationService;
    constructor(repo, producer, locationService) {
        this.repo = repo;
        this.producer = producer;
        this.locationService = locationService;
    }
    // CREATE POST
    async createPost(userId, input) {
        // EXTRACT MENTIONS   
        const mentions = input.content?.match(/@\w+/g) || [];
        // EXTRACT HASHTAGS
        const hashtags = input.content?.match(/#\w+/g) || [];
        //VALIDATE LOCATION ID
        let validatedLocationId;
        if (input.visibility === 'public') {
            validatedLocationId = undefined;
        }
        else {
            if (!input.locationId) {
                throw new Error('locationId is required for non-public posts');
            }
            const location = await this.locationService.findOne(input.locationId);
            if (!location) {
                throw new Error('Invalid locationId');
            }
            validatedLocationId = location.id;
        }
        // CREATE ENTITY
        const post = this.repo.create({
            authorId: userId,
            content: input.content,
            visibility: input.visibility || 'public',
            locationId: validatedLocationId,
        });
        // SAVE TO POSTGRES
        const saved = await this.repo.save(post);
        // EMIT EVENT
        await this.producer.postCreated({
            postId: saved.id,
            authorId: saved.authorId,
            content: saved.content,
            visibility: saved.visibility,
            mentions,
            hashtags,
            mediaIds: [],
            createdAt: saved.createdAt.toISOString(),
            locationId: saved.locationId,
        });
        return saved;
    }
    // GET POST
    async getPostById(id) {
        const post = await this.repo.findOne({
            where: {
                id,
            },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        return post;
    }
    // GET POSTS BY IDS
    async getPostsByIds(ids) {
        if (!ids.length) {
            return [];
        }
        return this.repo.find({
            where: {
                id: (0, typeorm_2.In)(ids),
            },
        });
    }
    // DELETE POST
    async deletePost(id, userId) {
        const post = await this.repo.findOne({
            where: {
                id,
            },
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (post.authorId !== userId) {
            throw new Error('Unauthorized');
        }
        await this.repo.delete(id);
        await this.producer.postRemoved({
            postId: post.id,
            authorId: post.authorId,
            removedAt: new Date().toISOString(),
        });
        return true;
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(post_entity_1.PostEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        post_producer_1.PostProducer,
        location_service_1.LocationService])
], PostService);
//# sourceMappingURL=post.service.js.map