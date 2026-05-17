CREATE TABLE IF NOT EXISTS post_viewers (

  post_id uuid,

  viewed_at timestamp,

  viewer_id uuid,

  dwell_time_ms bigint,

  PRIMARY KEY (
    post_id,
    viewed_at,
    viewer_id
  )

) WITH CLUSTERING ORDER BY (
  viewed_at DESC
);