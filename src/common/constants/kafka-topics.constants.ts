





export const KAFKA_TOPICS = {
  POST_CREATED: 'post.created',
  FOLLOW_CREATED: 'follow.created',
  FOLLOW_REMOVED: 'follow.removed',
  LIKE_CREATED: 'like.created',
  LIKE_REMOVED: 'like.removed',
  COMMENT_CREATED: 'comment.created',
HASHTAG_CREATED:'hashtag.created',
  NOTIFICATION_SEND: 'notification.send',
  LOCATION_UPDATED:'location.updated',
  USER_LOCATION_JOINED:'location.joined',
  LOCATION_INITIALIZED:'location.initialized'
} as const;