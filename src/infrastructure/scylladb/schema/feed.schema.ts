export const FEED_SCHEMA = [

  `
  CREATE TABLE IF NOT EXISTS social_app.home_feed (
    user_id UUID,
    bucket_date DATE,
    score BIGINT,
    item_type TEXT,
    created_at TIMESTAMP,
    post_id UUID,
    author_id UUID,
    PRIMARY KEY ((user_id, bucket_date),
      score,
      created_at,
      post_id
    )
  )
  WITH CLUSTERING ORDER BY ( score DESC,created_at DESC, post_id DESC);
  `,

  
  

  `
  CREATE TABLE IF NOT EXISTS social_app.user_feed (

  author_id UUID,

  bucket_date DATE,

  score BIGINT,

  item_type TEXT,

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
);
  `,

  // =====================================================
  // LOCATION FEED
  // =====================================================

  `
  CREATE TABLE IF NOT EXISTS social_app.location_feed (

    location_id UUID,

    bucket_date DATE,

    score BIGINT,
    item_type TEXT,

    created_at TIMESTAMP,

    post_id UUID,

    author_id UUID,

    PRIMARY KEY (

      (location_id, bucket_date),

      score,

      created_at,

      post_id
    )
  )

  WITH CLUSTERING ORDER BY (

    score DESC,

    created_at DESC,

    post_id DESC
  );
  `,
];