"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaConsumerService = void 0;
const common_1 = require("@nestjs/common");
const kafkajs_1 = require("kafkajs");
let KafkaConsumerService = class KafkaConsumerService {
    kafka = new kafkajs_1.Kafka({
        clientId: 'social-app',
        brokers: ['localhost:9092'],
    });
    consumer = this.kafka.consumer({
        groupId: 'feed-service',
    });
    async onModuleInit() {
        await this.consumer.connect();
        await this.consumer.subscribe({
            topic: 'post.created',
            fromBeginning: false,
        });
        await this.consumer.run({
            eachMessage: async ({ message }) => {
                const data = JSON.parse(message.value?.toString() || '{}');
                console.log('Kafka event received:', data);
                // 👉 CALL YOUR FEED FANOUT LOGIC HERE
            },
        });
    }
};
exports.KafkaConsumerService = KafkaConsumerService;
exports.KafkaConsumerService = KafkaConsumerService = __decorate([
    (0, common_1.Injectable)()
], KafkaConsumerService);
//# sourceMappingURL=kafka.consumer.js.map