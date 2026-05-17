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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let RedisService = class RedisService {
    client;
    constructor() {
        this.client =
            new ioredis_1.default({
                host: 'localhost',
                port: 6379,
            });
    }
    async onModuleDestroy() {
        await this.client.quit();
    }
    // =====================================================
    // GET
    // =====================================================
    async get(key) {
        return this.client.get(key);
    }
    // =====================================================
    // SET
    // =====================================================
    async set(key, value, mode, duration) {
        if (mode && duration) {
            return this.client.set(key, value, mode, duration);
        }
        return this.client.set(key, value);
    }
    // EXISTS
    async exists(key) {
        return this.client.exists(key);
    }
    // INCR  
    async incr(key) {
        return this.client.incr(key);
    }
    // INCRBY
    async incrBy(key, value) {
        return this.client.incrby(key, value);
    }
    // DECR
    async decr(key) {
        return this.client.decr(key);
    }
    // DEL
    async del(key) {
        return this.client.del(key);
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], RedisService);
//# sourceMappingURL=redis.service.js.map