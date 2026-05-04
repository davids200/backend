"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BootstrapModule = void 0;
const common_1 = require("@nestjs/common");
const kafka_module_1 = require("../infrastructure/kafka/kafka.module");
const redis_module_1 = require("../infrastructure/redis/redis.module");
const postgres_module_1 = require("../infrastructure/postgresql/postgres.module");
const minio_module_1 = require("../infrastructure/minio/minio.module");
const scylla_module_1 = require("../infrastructure/scylladb/scylla.module");
const bootstrap_service_1 = require("./bootstrap.service");
let BootstrapModule = class BootstrapModule {
};
exports.BootstrapModule = BootstrapModule;
exports.BootstrapModule = BootstrapModule = __decorate([
    (0, common_1.Module)({
        imports: [
            kafka_module_1.KafkaModule,
            redis_module_1.RedisModule,
            postgres_module_1.PostgresModule,
            scylla_module_1.ScyllaModule,
            minio_module_1.MinioModule,
        ],
        providers: [bootstrap_service_1.BootstrapService],
    })
], BootstrapModule);
//# sourceMappingURL=bootstrap.module.js.map