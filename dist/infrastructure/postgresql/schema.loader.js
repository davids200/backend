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
        console.log('🚀 Loading ScyllaDB schema...');
        // =========================
        // KEYSPACE
        // =========================
        await client.execute(`
      CREATE KEYSPACE IF NOT EXISTS social
      WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
    `);
        // =========================
        // USERS (light reference only)
        // =========================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.users (
        user_id UUID PRIMARY KEY,
        username TEXT,
        location_id TEXT,
        created_at TIMESTAMP
      );
    `);
        // =========================
        // POSTS (source of truth for media + content)
        // =========================
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
        // =========================
        // FEED (timeline - fastest read path)
        // =========================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.feed (
        user_id UUID,
        created_at TIMESTAMP,
        post_id UUID,
        author_id UUID,
        PRIMARY KEY (user_id, created_at)
      ) WITH CLUSTERING ORDER BY (created_at DESC);
    `);
        // =========================
        // FOLLOWS (used for fanout)
        // =========================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.follows (
        user_id UUID,
        following_id UUID,
        created_at TIMESTAMP,
        PRIMARY KEY (user_id, following_id)
      );
    `);
        // =========================
        // LIKES (fast existence check)
        // =========================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.likes (
        post_id UUID,
        user_id UUID,
        created_at TIMESTAMP,
        PRIMARY KEY (post_id, user_id)
      );
    `);
        // =========================
        // COMMENTS (flat structure for scale)
        // =========================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.comments (
        post_id UUID,
        comment_id UUID,
        user_id UUID,
        content TEXT,
        created_at TIMESTAMP,
        PRIMARY KEY (post_id, created_at)
      ) WITH CLUSTERING ORDER BY (created_at DESC);
    `);
        // =========================
        // NOTIFICATIONS (event log style)
        // =========================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.notifications (
        user_id UUID,
        notification_id UUID,
        type TEXT,
        payload TEXT,
        is_read BOOLEAN,
        created_at TIMESTAMP,
        PRIMARY KEY (user_id, created_at)
      ) WITH CLUSTERING ORDER BY (created_at DESC);
    `);
        console.log('✅ ScyllaDB schema ready');
    }
};
exports.ScyllaSchemaLoader = ScyllaSchemaLoader;
exports.ScyllaSchemaLoader = ScyllaSchemaLoader = __decorate([
    (0, common_1.Injectable)()
], ScyllaSchemaLoader);
//# sourceMappingURL=schema.loader.js.map