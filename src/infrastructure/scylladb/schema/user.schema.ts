 
export const USER_SCHEMA = [

`
CREATE TABLE IF NOT EXISTS social_app.users (

  user_id UUID PRIMARY KEY,

  username TEXT,

  display_name TEXT,

  profile_picture TEXT,

  bio TEXT,

  country_code TEXT,

  location_id TEXT,

  created_at TIMESTAMP
)
`,

`
CREATE TABLE IF NOT EXISTS social_app.user_interests (

  user_id UUID,

  topic TEXT,

  score DOUBLE,

  updated_at TIMESTAMP,

  PRIMARY KEY (

    (user_id),

    topic
  )
)
`,

`
CREATE TABLE IF NOT EXISTS social_app.followers_by_user (

  user_id UUID,

  follower_id UUID,

  created_at TIMESTAMP,

  PRIMARY KEY (

    (user_id),

    follower_id
  )
)
`,

`
CREATE TABLE IF NOT EXISTS social_app.follows_by_user (

  user_id UUID,

  following_id UUID,

  created_at TIMESTAMP,

  PRIMARY KEY (

    (user_id),

    following_id
  )
)
`,

];