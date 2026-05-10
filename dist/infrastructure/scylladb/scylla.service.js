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
const feed_schema_1 = require("./feed.schema");
let ScyllaService = ScyllaService_1 = class ScyllaService {
    logger = new common_1.Logger(ScyllaService_1.name);
    client;
    // =====================================================
    // MODULE INIT
    // =====================================================
    async onModuleInit() {
        // ================================================
        // CONNECT WITHOUT KEYSPACE
        // ================================================
        this.client =
            new cassandra_driver_1.Client({
                contactPoints: [
                    '127.0.0.1',
                ],
                localDataCenter: 'datacenter1',
            });
        await this.client.connect();
        // ================================================
        // CREATE KEYSPACE
        // ================================================
        await this.client.execute(`

      CREATE KEYSPACE IF NOT EXISTS social_app

      WITH replication = {

        'class': 'SimpleStrategy',

        'replication_factor': 1
      }

    `);
        this.logger.log('✔ Keyspace ensured');
        // ================================================
        // SWITCH KEYSPACE
        // ================================================
        this.client.keyspace =
            'social_app';
        // ================================================
        // MAIN FEED TABLE
        // ================================================
        await this.client.execute(feed_schema_1.FEED_TABLE);
        this.logger.log('✔ Feed table ensured');
        // ================================================
        // LOCATION FEED TABLE
        // ================================================
        await this.client.execute(`

      CREATE TABLE IF NOT EXISTS posts_by_location (

        location_id text,

        created_at timestamp,

        post_id text,

        author_id text,

        PRIMARY KEY (
          location_id,
          created_at,
          post_id
        )

      ) WITH CLUSTERING ORDER BY (
        created_at DESC
      );

    `);
        this.logger.log('✔ posts_by_location ensured');
        // ================================================
        // READY
        // ================================================
        this.logger.log('🚀 ScyllaDB schema initialized');
    }
    // =====================================================
    // INSERT USER FEED
    // =====================================================
    async insertFeedFanout(data) {
        const query = `

      INSERT INTO social_app.feed (

        user_id,

        created_at,

        post_id,

        author_id,

        location_id
      )

      VALUES (

        ?,

        toTimestamp(now()),

        ?,

        ?,

        ?
      )

    `;
        return this.client.execute(query, [
            data.user_id,
            data.post_id,
            data.author_id,
            data.location_id ?? null,
        ]);
    }
    // =====================================================
    // INSERT LOCATION FEED
    // =====================================================
    async insertLocationPost(data) {
        const query = `

      INSERT INTO posts_by_location (

        location_id,

        created_at,

        post_id,

        author_id
      )

      VALUES (?, ?, ?, ?)

    `;
        return this.client.execute(query, [
            data.location_id,
            data.created_at,
            data.post_id,
            data.author_id,
        ], {
            prepare: true,
        });
    }
    // =====================================================
    // GET USER FEED
    // =====================================================
    async getFeed(user_id, limit = 20) {
        const query = `

      SELECT *

      FROM social_app.feed

      WHERE user_id = ?

      LIMIT ?

    `;
        return this.client.execute(query, [
            user_id,
            limit,
        ], {
            prepare: true,
        });
    }
    // =====================================================
    // PAGINATED FEED
    // =====================================================
    async getFeedPaginated(userId, limit = 20, cursor) {
        let query = `

      SELECT *

      FROM social_app.feed

      WHERE user_id = ?

    `;
        const params = [
            userId,
        ];
        if (cursor) {
            query += `
        AND created_at < ?
      `;
            params.push(cursor);
        }
        query += `
      ORDER BY created_at DESC
      LIMIT ?
    `;
        params.push(limit);
        return this.client.execute(query, params, {
            prepare: true,
        });
    }
    // =====================================================
    // GENERIC EXECUTE
    // =====================================================
    async execute(query, params = [], options = {}) {
        return this.client.execute(query, params, {
            prepare: true,
            ...options,
        });
    }
};
exports.ScyllaService = ScyllaService;
exports.ScyllaService = ScyllaService = ScyllaService_1 = __decorate([
    (0, common_1.Injectable)()
], ScyllaService);
//# sourceMappingURL=scylla.service.js.map