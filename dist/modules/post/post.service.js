"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const crypto = __importStar(require("crypto"));
const post_entity_1 = require("./post.entity");
const post_producer_1 = require("./post.producer");
const location_service_1 = require("../location/location.service");
const redis_service_1 = require("../../infrastructure/redis/redis.service");
const topic_detector_util_1 = require("../feed/constants/utils/topic-detector.util");
const post_visibility_enum_1 = require("./enums/post-visibility.enum");
let PostService = class PostService {
    repo;
    producer;
    locationService;
    redis;
    constructor(repo, producer, locationService, redis) {
        this.repo = repo;
        this.producer = producer;
        this.locationService = locationService;
        this.redis = redis;
    }
    // =====================================================
    // CREATE POST
    // =====================================================
    async createPost(userId, input) {
        // ================================================
        // RATE LIMIT
        // ================================================
        const rateKey = `post-rate:${userId}`;
        const postCount = await this.redis.client.incr(rateKey);
        if (postCount === 1) {
            await this.redis.client.expire(rateKey, 60);
        }
        if (postCount > 5) {
            throw new common_1.BadRequestException('Posting too fast');
        }
        // ================================================
        // DUPLICATE CONTENT CHECK
        // ================================================
        const safeContent = input.content?.trim() || '';
        const contentHash = crypto
            .createHash('sha256')
            .update(safeContent)
            .digest('hex');
        const spamKey = `post-hash:${userId}:${contentHash}`;
        const exists = await this.redis.client.get(spamKey);
        if (exists) {
            throw new common_1.BadRequestException('Duplicate post detected');
        }
        await this.redis.client.set(spamKey, '1', 'EX', 60);
        // ================================================
        // EXTRACT MENTIONS
        // ================================================
        const mentions = safeContent.match(/@\w+/g) || [];
        // ================================================
        // EXTRACT HASHTAGS
        // ================================================
        const hashtags = safeContent.match(/#\w+/g) || [];
        // ================================================
        // DETECT TOPICS
        // ================================================
        const topics = (0, topic_detector_util_1.detectTopics)(safeContent);
        // ================================================
        // VALIDATE LOCATION
        // ================================================
        let validatedLocationId;
        if (input.visibility !==
            post_visibility_enum_1.PostVisibility.PUBLIC) {
            if (!input.locationId) {
                throw new common_1.BadRequestException('locationId required');
            }
            const location = await this.locationService
                .findOne(input.locationId);
            if (!location) {
                throw new common_1.BadRequestException('Invalid locationId');
            }
            validatedLocationId =
                location.id;
        }
        // ================================================
        // CREATE ENTITY
        // ================================================
        const post = this.repo.create({
            authorId: userId,
            content: input.content,
            visibility: input.visibility ||
                post_visibility_enum_1.PostVisibility.PUBLIC,
            locationId: validatedLocationId,
        });
        // ================================================
        // SAVE TO POSTGRESQL
        // ================================================
        const saved = await this.repo.save(post);
        // ================================================
        // EMIT EVENT
        // ================================================
        await this.producer.postCreated({
            postId: saved.id,
            authorId: saved.authorId,
            content: saved.content,
            visibility: saved.visibility,
            topics,
            mentions,
            hashtags,
            mediaIds: [],
            createdAt: saved.createdAt
                .toISOString(),
            locationId: saved.locationId,
        });
        return saved;
    }
    // =====================================================
    // GET POST
    // =====================================================
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
    // =====================================================
    // GET POSTS BY IDS
    // =====================================================
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
    // =====================================================
    // DELETE POST
    // =====================================================
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
            throw new common_1.BadRequestException('Unauthorized');
        }
        await this.repo.delete(id);
        await this.producer.postRemoved({
            postId: post.id,
            authorId: post.authorId,
            removedAt: new Date()
                .toISOString(),
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
        location_service_1.LocationService,
        redis_service_1.RedisService])
], PostService);
//# sourceMappingURL=post.service.js.map