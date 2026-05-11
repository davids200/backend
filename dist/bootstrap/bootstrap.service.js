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
var BootstrapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BootstrapService = void 0;
const common_1 = require("@nestjs/common");
const kafka_bootstrap_1 = require("../infrastructure/kafka/kafka.bootstrap");
const schema_loader_1 = require("../infrastructure/scylladb/schema/schema.loader");
let BootstrapService = BootstrapService_1 = class BootstrapService {
    kafkaBootstrap;
    scyllaSchemaLoader;
    logger = new common_1.Logger(BootstrapService_1.name);
    constructor(kafkaBootstrap, scyllaSchemaLoader) {
        this.kafkaBootstrap = kafkaBootstrap;
        this.scyllaSchemaLoader = scyllaSchemaLoader;
    }
    async onApplicationBootstrap() {
        this.logger.log('🚀 Bootstrapping system...');
        try {
            // 1. Setup Database Schema
            await this.scyllaSchemaLoader.load();
            this.logger.log('✅ Scylla schema ready');
            // 2. Setup Kafka Topics
            await this.kafkaBootstrap.bootstrapTopics();
            this.logger.log('✅ Kafka topics ready');
            this.logger.log('🔥 System bootstrap complete');
        }
        catch (error) {
            this.logger.error('❌ Bootstrap failed', error);
            process.exit(1); // Force crash if infrastructure isn't ready
        }
    }
};
exports.BootstrapService = BootstrapService;
exports.BootstrapService = BootstrapService = BootstrapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [kafka_bootstrap_1.KafkaBootstrapService,
        schema_loader_1.ScyllaSchemaLoader])
], BootstrapService);
//# sourceMappingURL=bootstrap.service.js.map