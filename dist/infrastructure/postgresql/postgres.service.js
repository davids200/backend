"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresService = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
let PostgresService = class PostgresService {
    client;
    async init() {
        this.client = new pg_1.Client({
            host: 'localhost',
            port: 5432,
            user: 'admin',
            password: 'admin',
            database: 'social_app',
        });
        await this.client.connect();
        console.log('Postgres connected');
        await this.createSchema();
    }
    async createSchema() {
        await this.client.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        location_id TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    }
    getClient() {
        return this.client;
    }
    async query(text, params) {
        return this.client.query(text, params);
    }
    async onModuleDestroy() {
        await this.client.end();
    }
};
exports.PostgresService = PostgresService;
exports.PostgresService = PostgresService = __decorate([
    (0, common_1.Injectable)()
], PostgresService);
//# sourceMappingURL=postgres.service.js.map