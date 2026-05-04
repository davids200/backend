"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScyllaSchemaLoader = void 0;
const common_1 = require("@nestjs/common");
let ScyllaSchemaLoader = class ScyllaSchemaLoader {
    async load(client) {
        console.log('Loading Scylla schema...');
        // KEYSPACE
        await client.execute(`
      CREATE KEYSPACE IF NOT EXISTS social
      WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
    `);
        // FEED TABLE (timeline)
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.feed (
  user_id UUID,
  created_at TIMESTAMP,
  post_id UUID,
  author_id UUID,
  location_id TEXT,
  PRIMARY KEY (user_id, created_at)
) WITH CLUSTERING ORDER BY (created_at DESC);
    `);
        // POSTS TABLE (denormalized)
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.posts (
        post_id UUID PRIMARY KEY,
        user_id UUID,
        content TEXT,
        media LIST<TEXT>,
        location_id TEXT,
        created_at TIMESTAMP
      );
    `);
        console.log('Scylla schema ready');
    }
};
exports.ScyllaSchemaLoader = ScyllaSchemaLoader;
exports.ScyllaSchemaLoader = ScyllaSchemaLoader = __decorate([
    (0, common_1.Injectable)()
], ScyllaSchemaLoader);
//# sourceMappingURL=schema.loader.js.map