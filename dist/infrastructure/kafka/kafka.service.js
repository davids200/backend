"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var KafkaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KafkaService = void 0;
const common_1 = require("@nestjs/common");
const kafkajs_1 = require("kafkajs");
let KafkaService = KafkaService_1 = class KafkaService {
    logger = new common_1.Logger(KafkaService_1.name);
    // =====================================================
    // KAFKA INSTANCE
    // =====================================================
    kafka = new kafkajs_1.Kafka({
        clientId: 'social-app',
        brokers: [
            'localhost:9092',
        ],
    });
    // =====================================================
    // PRODUCER
    // =====================================================
    producer;
    // =====================================================
    // ACTIVE CONSUMERS
    // =====================================================
    consumers = [];
    // =====================================================
    // MODULE INIT
    // =====================================================
    async onModuleInit() {
        try {
            this.producer =
                this.kafka.producer({
                    createPartitioner: kafkajs_1.Partitioners.LegacyPartitioner,
                });
            await this.producer.connect();
            this.logger.log('✅ Kafka producer connected');
        }
        catch (err) {
            this.logger.error('❌ Kafka producer connection failed', err);
            throw err;
        }
    }
    // =====================================================
    // EMIT EVENT
    // =====================================================
    async emit(topic, value, key) {
        try {
            this.logger.log(`📤 Emitting → ${topic}`);
            await this.producer.send({
                topic,
                messages: [
                    {
                        key,
                        value: JSON.stringify(value),
                    },
                ],
            });
            this.logger.log(`✅ Event emitted → ${topic}`);
        }
        catch (err) {
            this.logger.error(`❌ Emit failed (${topic})`, err);
            throw err;
        }
    }
    // =====================================================
    // CONSUME EVENTS
    // =====================================================
    async consume(groupId, topic, handler) {
        try {
            this.logger.log(`👂 Creating consumer → ${topic}`);
            const consumer = this.kafka.consumer({
                groupId,
            });
            this.consumers.push(consumer);
            // ================================================
            // CONNECT
            // ================================================
            await consumer.connect();
            this.logger.log(`✅ Consumer connected → ${topic}`);
            // ================================================
            // SUBSCRIBE
            // ================================================
            await consumer.subscribe({
                topic,
                fromBeginning: false,
            });
            this.logger.log(`✅ Subscribed → ${topic}`);
            // ================================================
            // RUN
            // ================================================
            consumer.run({
                eachMessage: async ({ message, }) => {
                    try {
                        if (!message.value) {
                            return;
                        }
                        this.logger.log(`🔥 Event received → ${topic}`);
                        const raw = message.value.toString();
                        this.logger.debug(raw);
                        // ==========================================
                        // PARSE
                        // ==========================================
                        const payload = JSON.parse(raw);
                        // ==========================================
                        // HANDLE
                        // ==========================================
                        await handler(payload);
                    }
                    catch (err) {
                        this.logger.error(`❌ Consume failed (${topic})`, err);
                    }
                },
            });
            this.logger.log(`🚀 Consumer running → ${topic}`);
        }
        catch (err) {
            this.logger.error(`❌ Consumer startup failed (${topic})`, err);
            throw err;
        }
    }
    // =====================================================
    // MODULE DESTROY
    // =====================================================
    async onModuleDestroy() {
        try {
            // ================================================
            // DISCONNECT PRODUCER
            // ================================================
            if (this.producer) {
                await this.producer.disconnect();
            }
            // ================================================
            // DISCONNECT CONSUMERS
            // ================================================
            await Promise.all(this.consumers.map(async (consumer) => {
                await consumer.disconnect();
            }));
            this.logger.log('🛑 Kafka connections closed');
        }
        catch (err) {
            this.logger.error('❌ Kafka shutdown failed', err);
        }
    }
};
exports.KafkaService = KafkaService;
exports.KafkaService = KafkaService = KafkaService_1 = __decorate([
    (0, common_1.Injectable)()
], KafkaService);
//# sourceMappingURL=kafka.service.js.map