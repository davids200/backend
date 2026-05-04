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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostProducer = void 0;
const common_1 = require("@nestjs/common");
const kafka_service_1 = require("../kafka.service");
const kafka_topics_1 = require("../kafka.topics");
let PostProducer = class PostProducer {
    kafka;
    constructor(kafka) {
        this.kafka = kafka;
    }
    async postCreated(data) {
        return this.kafka.emit(kafka_topics_1.KAFKA_TOPICS.POST_CREATED, data, data.postId);
    }
};
exports.PostProducer = PostProducer;
exports.PostProducer = PostProducer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kafka_service_1.KafkaService])
], PostProducer);
//# sourceMappingURL=post.producer.js.map