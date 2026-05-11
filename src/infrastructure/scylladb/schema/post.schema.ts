 
export const POST_SCHEMA = [

`
CREATE TABLE IF NOT EXISTS social_app.posts_by_id (

  post_id UUID PRIMARY KEY,

  user_id UUID,

  content TEXT,

  visibility TEXT,

  location_id TEXT,

  created_at TIMESTAMP
)
`,

`
CREATE TABLE IF NOT EXISTS social_app.posts_by_user (

  user_id UUID,

  created_at TIMESTAMP,

  post_id UUID,

  content TEXT,

  visibility TEXT,

  location_id TEXT,

  PRIMARY KEY (

    (user_id),

    created_at,

    post_id
  )
)

WITH CLUSTERING ORDER BY (

  created_at DESC,

  post_id DESC
)
`,

`
CREATE TABLE IF NOT EXISTS social_app.posts_by_location (

  location_id TEXT,

  created_at TIMESTAMP,

  post_id UUID,

  author_id UUID,

  content TEXT,

  PRIMARY KEY (

    (location_id),

    created_at,

    post_id
  )
)

WITH CLUSTERING ORDER BY (

  created_at DESC,

  post_id DESC
)
`,

`
CREATE TABLE IF NOT EXISTS social_app.likes_by_post (

  post_id UUID,

  user_id UUID,

  created_at TIMESTAMP,

  PRIMARY KEY (

    (post_id),

    user_id
  )
)
`,

`
CREATE TABLE IF NOT EXISTS social_app.likes_by_user (

  user_id UUID,

  created_at TIMESTAMP,

  post_id UUID,

  PRIMARY KEY (

    (user_id),

    created_at,

    post_id
  )
)

WITH CLUSTERING ORDER BY (

  created_at DESC,

  post_id DESC
)
`,

`
CREATE TABLE IF NOT EXISTS social_app.comments_by_post (

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
)

WITH CLUSTERING ORDER BY (

  created_at DESC,

  comment_id DESC
)
`,

`
CREATE TABLE IF NOT EXISTS social_app.hashtags_by_post (

  post_id UUID,

  hashtag TEXT,

  PRIMARY KEY (

    (post_id),

    hashtag
  )
)
`,

`
CREATE TABLE IF NOT EXISTS social_app.posts_by_hashtag (

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
)

WITH CLUSTERING ORDER BY (

  score DESC,

  created_at DESC,

  post_id DESC
)
`,

];