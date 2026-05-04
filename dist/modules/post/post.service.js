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
const minio_service_1 = require("../../infrastructure/minio/minio.service");
const kafka_service_1 = require("../../infrastructure/kafka/kafka.service");
const typeorm_1 = require("typeorm");
const post_entity_1 = require("./post.entity");
const typeorm_2 = require("@nestjs/typeorm");
const postgres_service_1 = require("../../infrastructure/postgresql/postgres.service");
let PostService = class PostService {
    minio;
    kafka;
    postRepo;
    postgres;
    postRepository;
    constructor(minio, kafka, postRepo, postgres) {
        this.minio = minio;
        this.kafka = kafka;
        this.postRepo = postRepo;
        this.postgres = postgres;
    }
    async createPost(userId, data) {
        const post = await this.postRepo.save({
            ...data,
            userId,
        });
        await this.kafka.emit('post.created', {
            postId: post.id,
            userId,
            locationId: post.locationId,
        });
        return post;
    }
    async getFollowing(userId) {
        const result = await this.postgres.query(`
SELECT u.id, u.is_celebrity
FROM follows f
JOIN users u ON u.id = f.following_id
WHERE f.follower_id = $1
`, [userId]);
        return result.rows;
    }
    async getPostsByIds(postIds) {
        if (!postIds.length)
            return [];
        return this.postRepository.find({
            where: { id: (0, typeorm_1.In)(postIds) },
        });
    }
};
exports.PostService = PostService;
exports.PostService = PostService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_2.InjectRepository)(post_entity_1.PostEntity)),
    __metadata("design:paramtypes", [minio_service_1.MinioService,
        kafka_service_1.KafkaService,
        typeorm_1.Repository,
        postgres_service_1.PostgresService])
], PostService);
//# sourceMappingURL=post.service.js.map