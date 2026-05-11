 
export const FEED_SCHEMA = [



`CREATE TABLE IF NOT EXISTS social_app.user_feed (

  author_id UUID,

  bucket_date DATE,

  created_at TIMESTAMP,

  post_id UUID,

  PRIMARY KEY (

    (author_id, bucket_date),

    created_at,

    post_id
  )

)

WITH CLUSTERING ORDER BY (

  created_at DESC,

  post_id DESC
);`,



`CREATE TABLE IF NOT EXISTS social_app.location_feed (

  location_id TEXT,

  bucket_date DATE,

  created_at TIMESTAMP,

  post_id UUID,

  author_id UUID,

  PRIMARY KEY (

    (location_id, bucket_date),

    created_at,

    post_id
  )

)

WITH CLUSTERING ORDER BY (

  created_at DESC,

  post_id DESC
);`,



`CREATE TABLE IF NOT EXISTS social_app.hashtag_feed (

  hashtag TEXT,

  bucket_date DATE,

  score BIGINT,

  created_at TIMESTAMP,

  post_id UUID,

  author_id UUID,

  PRIMARY KEY (

    (hashtag, bucket_date),

    score,

    created_at,

    post_id
  )

)

WITH CLUSTERING ORDER BY (

  score DESC,

  created_at DESC,

  post_id DESC
);`,



`CREATE TABLE IF NOT EXISTS social_app.topic_feed (

  topic TEXT,

  bucket_date DATE,

  score BIGINT,

  created_at TIMESTAMP,

  post_id UUID,

  author_id UUID,

  PRIMARY KEY (

    (topic, bucket_date),

    score,

    created_at,

    post_id
  )

)

WITH CLUSTERING ORDER BY (

  score DESC,

  created_at DESC,

  post_id DESC
);`,



`CREATE TABLE IF NOT EXISTS social_app.celebrity_feed (

  author_id UUID,

  bucket_date DATE,

  score BIGINT,

  created_at TIMESTAMP,

  post_id UUID,

  PRIMARY KEY (

    (author_id, bucket_date),

    score,

    created_at,

    post_id
  )
)

WITH CLUSTERING ORDER BY (

  score DESC,

  created_at DESC,

  post_id DESC
);`,



`CREATE TABLE IF NOT EXISTS social_app.user_interests (

  user_id UUID,

  topic TEXT,

  score BIGINT,

  updated_at TIMESTAMP,

  PRIMARY KEY (

    (user_id),

    topic
  )
);`,



`CREATE TABLE IF NOT EXISTS social_app.trending_hashtags (

  bucket_hour TEXT,

  hashtag TEXT,

  score BIGINT,

  post_count BIGINT,

  PRIMARY KEY (

    (bucket_hour),

    hashtag
  )
);`,



`CREATE TABLE IF NOT EXISTS social_app.feed_seen (

  user_id UUID,

  post_id UUID,

  seen_at TIMESTAMP,

  PRIMARY KEY (

    (user_id),

    post_id
  )
);`,



`CREATE TABLE IF NOT EXISTS social_app.feed_outbox (

  event_id UUID PRIMARY KEY,

  type TEXT,

  payload TEXT,

  processed BOOLEAN,

  created_at TIMESTAMP
);`,
];