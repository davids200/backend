





export const KAFKA_TOPICS = {
  POST_CREATED: 'post.created',
  POST_REMOVED:'post.removed',
  POST_UPDATED:'post.updated',
  POST_DELETED:'post.deleted',
  POST_LIKED:'post.liked',
  POST_COMMENTED:'post.commented',
  FOLLOW_CREATED:'follow.created',
  FOLLOW_REMOVED:'follow.removed',
  LIKE_CREATED:'like.created',
  LIKE_REMOVED:'like.removed',
  COMMENT_CREATED: 'comment.created',
  COMMENT_REMOVED:'comment.removed',
HASHTAG_CREATED:'hashtag.created',
  NOTIFICATION_SEND: 'notification.send',
  LOCATION_UPDATED:'location.updated',
  USER_LOCATION_JOINED:'location.joined',
  LOCATION_INITIALIZED:'location.initialized',
  NOTIFICATION_OTP_REQUESTED:'notification.otp.requested',
  NOTIFICATION_CREATED:'notification.created',
  NOTIFICATION_SECURITY_ALERT:'notification.security.alert',
  NOTIFICATION_WELCOME:'notification.welcome',
  FEED_INVALIDATE:'feed.invaliddate',
  FEED_FANOUT:'feed.fanout',
  TRENDING_UPDATE:'trending.update',
  COMMENT_DELETED:'comment.delete',
  BOOKMARK_CREATED:'bookmark.created',
  BOOKMARK_REMOVED:'bookmark.removed',
  REPOST_CREATED:'repost.created',
  REPOST_REMOVED:'repost.removed',
  ENGAGEMENT_UPDATED:'engagement.updated',
  
} as const;