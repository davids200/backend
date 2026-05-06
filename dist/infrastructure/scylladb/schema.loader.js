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
        // =====================================================
        // KEYSPACE /DATABASE IN RDS
        //'replication_factor': 1 // production 3
        // =====================================================
        await client.execute(`
      CREATE KEYSPACE IF NOT EXISTS social
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1 
      };
    `);
        // =====================================================
        // USERS
        // =====================================================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.users (
        user_id UUID PRIMARY KEY,
        username TEXT,
        profile_picture TEXT,
        bio TEXT,
        country_code TEXT,
        location_id TEXT,
        created_at TIMESTAMP
      );
    `);
        // =====================================================
        // POSTS (SOURCE OF TRUTH)
        // =====================================================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.posts_by_id (
        post_id UUID PRIMARY KEY,
        user_id UUID,
        content TEXT,
        media LIST<TEXT>,
        media_type TEXT,
        visibility TEXT,
        country_code TEXT,
        location_id TEXT,
        likes_count COUNTER,
        comments_count COUNTER,
        shares_count COUNTER,
        created_at TIMESTAMP
      );
    `);
        // =====================================================
        // POSTS BY USER (PROFILE TIMELINE)
        // =====================================================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.posts_by_user (
        user_id UUID,
        created_at TIMESTAMP,
        post_id UUID,
        content TEXT,
        media LIST<TEXT>,
        media_type TEXT,
        location_id TEXT,

        PRIMARY KEY (
          (user_id),
          created_at,
          post_id
        )
      ) WITH CLUSTERING ORDER BY (
        created_at DESC,
        post_id DESC
      );
    `);
        // =====================================================
        // POSTS BY LOCATION
        // =====================================================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.posts_by_location (
        location_id TEXT,
        created_at TIMESTAMP,
        post_id UUID,
        author_id UUID,
        content TEXT,
        media LIST<TEXT>,

        PRIMARY KEY (
          (location_id),
          created_at,
          post_id
        )
      ) WITH CLUSTERING ORDER BY (
        created_at DESC,
        post_id DESC
      );
    `);
        // =====================================================
        // POSTS BY COUNTRY
        // =====================================================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.posts_by_country (
        country_code TEXT,
        created_at TIMESTAMP,
        post_id UUID,
        author_id UUID,
        content TEXT,
        media LIST<TEXT>,

        PRIMARY KEY (
          (country_code),
          created_at,
          post_id
        )
      ) WITH CLUSTERING ORDER BY (
        created_at DESC,
        post_id DESC
      );
    `);
        // =====================================================
        // FEED TABLE (RANKED HOME FEED)
        // =====================================================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.feed_by_user (
        user_id UUID,
        bucket_date DATE,
        score DOUBLE,
        created_at TIMESTAMP,
        post_id UUID,
        author_id UUID,
        location_id TEXT,

        PRIMARY KEY (
          (user_id, bucket_date),
          score,
          created_at,
          post_id
        )
      ) WITH CLUSTERING ORDER BY (
        score DESC,
        created_at DESC,
        post_id DESC
      );
    `);
        // =====================================================
        // FOLLOWS
        // =====================================================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.follows_by_user (
        user_id UUID,
        following_id UUID,
        created_at TIMESTAMP,

        PRIMARY KEY (
          (user_id),
          following_id
        )
      );
    `);
        // =====================================================
        // FOLLOWERS
        // =====================================================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.followers_by_user (
        user_id UUID,
        follower_id UUID,
        created_at TIMESTAMP,

        PRIMARY KEY (
          (user_id),
          follower_id
        )
      );
    `);
        // =====================================================
        // LIKES BY POST
        // =====================================================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.likes_by_post (
        post_id UUID,
        user_id UUID,
        created_at TIMESTAMP,

        PRIMARY KEY (
          (post_id),
          user_id
        )
      );
    `);
        // =====================================================
        // LIKES BY USER
        // =====================================================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.likes_by_user (
        user_id UUID,
        created_at TIMESTAMP,
        post_id UUID,

        PRIMARY KEY (
          (user_id),
          created_at,
          post_id
        )
      ) WITH CLUSTERING ORDER BY (
        created_at DESC,
        post_id DESC
      );
    `);
        // =====================================================
        // COMMENTS
        // =====================================================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.comments_by_post (
        post_id UUID,
        created_at TIMESTAMP,
        comment_id UUID,
        user_id UUID,
        content TEXT,

        PRIMARY KEY (
          (post_id),
          created_at,
          comment_id
        )
      ) WITH CLUSTERING ORDER BY (
        created_at DESC,
        comment_id DESC
      );
    `);
        // =====================================================
        // NOTIFICATIONS
        // =====================================================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.notifications_by_user (
        user_id UUID,
        bucket_date DATE,
        created_at TIMESTAMP,
        notification_id UUID,
        type TEXT,
        payload TEXT,
        is_read BOOLEAN,

        PRIMARY KEY (
          (user_id, bucket_date),
          created_at,
          notification_id
        )
      ) WITH CLUSTERING ORDER BY (
        created_at DESC,
        notification_id DESC
      );
    `);
        // =====================================================
        // TRENDING POSTS
        // =====================================================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.trending_posts (
        bucket_hour TEXT,
        score DOUBLE,
        post_id UUID,
        user_id UUID,
        created_at TIMESTAMP,

        PRIMARY KEY (
          (bucket_hour),
          score,
          post_id
        )
      ) WITH CLUSTERING ORDER BY (
        score DESC,
        post_id DESC
      );
    `);
        // =====================================================
        // FEED OUTBOX (KAFKA RECOVERY)
        // =====================================================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.feed_outbox (
        event_id UUID PRIMARY KEY,
        type TEXT,
        payload TEXT,
        processed BOOLEAN,
        created_at TIMESTAMP
      );
    `);
        // =====================================================
        // STORY FEED (AUTO EXPIRES)
        // =====================================================
        await client.execute(`
      CREATE TABLE IF NOT EXISTS social.story_feed (
        user_id UUID,
        created_at TIMESTAMP,
        story_id UUID,

        PRIMARY KEY (
          (user_id),
          created_at,
          story_id
        )
      ) WITH CLUSTERING ORDER BY (
        created_at DESC,
        story_id DESC
      )
      AND default_time_to_live = 86400;
    `);
        await client.execute(`
  CREATE TABLE IF NOT EXISTS social.hashtags_by_post (
    post_id UUID,
    hashtag TEXT,

    PRIMARY KEY (
      (post_id),
      hashtag
    )
  );
`);
        await client.execute(`
  CREATE TABLE IF NOT EXISTS social.posts_by_hashtag (
    hashtag TEXT,
    score DOUBLE,
    created_at TIMESTAMP,
    post_id UUID,
    author_id UUID,

    PRIMARY KEY (
      (hashtag),
      score,
      created_at,
      post_id
    )
  ) WITH CLUSTERING ORDER BY (
    score DESC,
    created_at DESC,
    post_id DESC
  );
`);
        await client.execute(`
  CREATE TABLE IF NOT EXISTS social.trending_hashtags (
    bucket_hour TEXT,
    score DOUBLE,
    hashtag TEXT,

    PRIMARY KEY (
      (bucket_hour),
      score,
      hashtag
    )
  ) WITH CLUSTERING ORDER BY (
    score DESC,
    hashtag DESC
  );
`);
        console.log('✅ ScyllaDB schema ready');
    }
};
exports.ScyllaSchemaLoader = ScyllaSchemaLoader;
exports.ScyllaSchemaLoader = ScyllaSchemaLoader = __decorate([
    (0, common_1.Injectable)()
], ScyllaSchemaLoader);
//# sourceMappingURL=schema.loader.js.map