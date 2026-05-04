"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEED_TABLE = void 0;
exports.FEED_TABLE = `
CREATE TABLE IF NOT EXISTS feeds (
  user_id text,
  created_at timestamp,
  post_id text,
  author_id text,
  content text,
  media_urls list<text>,
  PRIMARY KEY (user_id, created_at)
) WITH CLUSTERING ORDER BY (created_at DESC);
`;
//# sourceMappingURL=feed.schema.js.map