"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ScyllaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScyllaService = void 0;
const common_1 = require("@nestjs/common");
const cassandra_driver_1 = require("cassandra-driver");
let ScyllaService = ScyllaService_1 = class ScyllaService {
    logger = new common_1.Logger(ScyllaService_1.name);
    client;
    // =====================================================
    // MODULE INIT
    // =====================================================
    async onModuleInit() {
        try {
            this.client =
                new cassandra_driver_1.Client({
                    contactPoints: [
                        '127.0.0.1',
                    ],
                    localDataCenter: 'datacenter1',
                });
            await this.client.connect();
            this.logger.log('✅ Scylla connected');
        }
        catch (error) {
            this.logger.error('❌ Scylla initialization failed');
            throw error;
        }
    }
    // =====================================================
    // EXECUTE QUERY
    // =====================================================
    async execute(query, params = []) {
        return this.client.execute(query, params, {
            prepare: true,
        });
    }
};
exports.ScyllaService = ScyllaService;
exports.ScyllaService = ScyllaService = ScyllaService_1 = __decorate([
    (0, common_1.Injectable)()
], ScyllaService);
//# sourceMappingURL=scylla.service.js.map