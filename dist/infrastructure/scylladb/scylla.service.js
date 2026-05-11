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
var ScyllaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScyllaService = void 0;
const common_1 = require("@nestjs/common");
const cassandra_driver_1 = require("cassandra-driver");
const promises_1 = require("node:timers/promises");
let ScyllaService = ScyllaService_1 = class ScyllaService {
    logger = new common_1.Logger(ScyllaService_1.name);
    client;
    isInitialized = false;
    initializationPromise;
    resolveInit;
    constructor() {
        this.initializationPromise = new Promise((resolve) => {
            this.resolveInit = resolve;
        });
    }
    async onModuleInit() {
        const contactPoints = ['127.0.0.1'];
        const localDataCenter = 'datacenter1';
        const keyspace = 'social_app';
        try {
            // STEP 1: Connect to the cluster without a specific keyspace
            const bootstrapClient = new cassandra_driver_1.Client({
                contactPoints,
                localDataCenter,
                socketOptions: { connectTimeout: 10000 }
            });
            await bootstrapClient.connect();
            this.logger.log('📡 Connected to Scylla cluster for bootstrap');
            // STEP 2: Create Keyspace if it doesn't exist
            // SimpleStrategy is fine for development/single-node. 
            // NetworkTopologyStrategy is recommended for production.
            const createKeyspaceQuery = `
        CREATE KEYSPACE IF NOT EXISTS ${keyspace}
        WITH replication = {
          'class': 'SimpleStrategy',
          'replication_factor': 1
        };
      `;
            await bootstrapClient.execute(createKeyspaceQuery);
            this.logger.log(`✅ Keyspace "${keyspace}" ensured`);
            // Cleanup bootstrap connection
            await bootstrapClient.shutdown();
            // STEP 3: Wait briefly for schema metadata to propagate across nodes
            await (0, promises_1.setTimeout)(1000);
            // STEP 4: Initialize the "Real" client used by the app
            this.client = new cassandra_driver_1.Client({
                contactPoints,
                localDataCenter,
                keyspace,
            });
            await this.client.connect();
            this.isInitialized = true;
            this.resolveInit();
            this.logger.log(`🚀 Scylla client connected to keyspace: ${keyspace}`);
        }
        catch (error) {
            this.logger.error('❌ Scylla initialization failed');
            // In a real app, you might want to retry or exit the process here
            throw error;
        }
    }
    async waitReady() {
        return this.initializationPromise;
    }
    async execute(query, params = []) {
        if (!this.isInitialized)
            await this.waitReady();
        return this.client.execute(query, params, { prepare: true });
    }
};
exports.ScyllaService = ScyllaService;
exports.ScyllaService = ScyllaService = ScyllaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ScyllaService);
//# sourceMappingURL=scylla.service.js.map