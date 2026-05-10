"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FEED_TABLE = void 0;
exports.FEED_TABLE = `

CREATE TABLE IF NOT EXISTS user_feed (
  user_id text,
  created_at timestamp,
  post_id text,
  author_id text,
  content text,
  media_urls list<text>,
  visibility text,
  PRIMARY KEY ((user_id),created_at,post_id))
WITH CLUSTERING ORDER BY (
  created_at DESC,
  post_id DESC
);
`;
//# sourceMappingURL=feed.schema.js.map