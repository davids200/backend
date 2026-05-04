"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaService = void 0;
const common_1 = require("@nestjs/common");
const kafkajs_1 = require("kafkajs");
let KafkaService = class KafkaService {
    kafka = new kafkajs_1.Kafka({
        clientId: 'social-app',
        brokers: ['localhost:9092'],
    });
    producer;
    consumer;
    async onModuleInit() {
        this.producer = this.kafka.producer();
        await this.producer.connect();
    }
    // ✅ PRODUCER
    async emit(topic, value, key) {
        await this.producer.send({
            topic,
            messages: [
                {
                    key,
                    value: JSON.stringify(value),
                },
            ],
        });
    }
    // ✅ CONSUMER WRAPPER
    async consume(groupId, topic, handler) {
        const consumer = this.kafka.consumer({ groupId });
        await consumer.connect();
        await consumer.subscribe({
            topic,
            fromBeginning: false,
        });
        await consumer.run({
            eachMessage: async ({ message }) => {
                await handler(message);
            },
        });
        this.consumer = consumer;
    }
    async onModuleDestroy() {
        await this.producer?.disconnect();
        await this.consumer?.disconnect();
    }
};
exports.KafkaService = KafkaService;
exports.KafkaService = KafkaService = __decorate([
    (0, common_1.Injectable)()
], KafkaService);
//# sourceMappingURL=kafka.service.js.map