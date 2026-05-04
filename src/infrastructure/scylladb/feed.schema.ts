export const FEED_TABLE = `
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


