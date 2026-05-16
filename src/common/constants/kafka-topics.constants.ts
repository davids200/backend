export const KAFKA_TOPICS = {

  // =====================================================
  // POSTS
  // =====================================================

  POST_CREATED:'post.created',

  POST_UPDATED:'post.updated',

  POST_DELETED:'post.deleted',

  // =====================================================
  // FEEDS
  // =====================================================

  FEED_FANOUT:'feed.fanout',

  FEED_INVALIDATE:'feed.invalidate',

  // =====================================================
  // FOLLOWS
  // =====================================================

  FOLLOW_CREATED:'follow.created',

  FOLLOW_REMOVED:'follow.removed',

  // =====================================================
  // LIKES
  // =====================================================

  LIKE_CREATED:'like.created',

  LIKE_REMOVED:'like.removed',

  // =====================================================
  // COMMENTS
  // =====================================================

  COMMENT_CREATED:'comment.created',

  COMMENT_REMOVED:'comment.removed',

  // =====================================================
  // BOOKMARKS
  // =====================================================

  BOOKMARK_CREATED:'bookmark.created',

  BOOKMARK_REMOVED:'bookmark.removed',

  // =====================================================
  // REPOSTS
  // =====================================================

  REPOST_CREATED:'repost.created',

  REPOST_REMOVED:'repost.removed',

  // =====================================================
  // VIEWS
  // =====================================================

  VIEW_CREATED:'view.created',

  // =====================================================
  // ENGAGEMENT
  // =====================================================

  ENGAGEMENT_UPDATED:'engagement.updated',
ENGAGEMENT_SIGNAL:'engagement.signal',
  TRENDING_UPDATED:'trending.updated',

  // =====================================================
  // HASHTAGS
  // =====================================================

  HASHTAG_CREATED:'hashtag.created',

  // =====================================================
  // LOCATIONS
  // =====================================================

  LOCATION_UPDATED:'location.updated',

  LOCATION_JOINED:'location.joined',

  LOCATION_INITIALIZED:'location.initialized',

  // =====================================================
  // NOTIFICATIONS
  // =====================================================

  NOTIFICATION_CREATED:'notification.created',

  NOTIFICATION_SEND:'notification.send',

  NOTIFICATION_OTP_REQUESTED:
    'notification.otp.requested',

  NOTIFICATION_SECURITY_ALERT:
    'notification.security.alert',

  NOTIFICATION_WELCOME:
    'notification.welcome',

} as const;