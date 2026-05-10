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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioService = void 0;
const common_1 = require("@nestjs/common");
const Minio = __importStar(require("minio"));
const crypto_1 = require("crypto");
let MinioService = class MinioService {
    client;
    bucket = 'posts';
    async onModuleInit() {
        this.client = new Minio.Client({
            endPoint: 'localhost',
            port: 9000,
            useSSL: false,
            accessKey: 'admin',
            secretKey: 'password',
        });
        const exists = await this.client.bucketExists(this.bucket);
        if (!exists) {
            await this.client.makeBucket(this.bucket, 'us-east-1');
        }
    }
    async uploadBase64(base64) {
        const buffer = Buffer.from(base64, 'base64');
        const filename = `${(0, crypto_1.randomUUID)()}.jpg`;
        await this.client.putObject(this.bucket, filename, buffer);
        return `http://localhost:9000/${this.bucket}/${filename}`;
    }
    // =====================================================
    // UPLOAD BUFFER
    // =====================================================
    async uploadBuffer(data) {
        const exists = await this.client.bucketExists(data.bucket);
        // CREATE BUCKET IF MISSING
        if (!exists) {
            await this.client.makeBucket(data.bucket, 'us-east-1');
        }
        // UPLOAD OBJECT
        await this.client.putObject(data.bucket, data.objectName, data.buffer, data.buffer.length, {
            'Content-Type': data.mimetype,
        });
        return { bucket: data.bucket, objectName: data.objectName, };
    }
};
exports.MinioService = MinioService;
exports.MinioService = MinioService = __decorate([
    (0, common_1.Injectable)()
], MinioService);
//# sourceMappingURL=minio.service.js.map