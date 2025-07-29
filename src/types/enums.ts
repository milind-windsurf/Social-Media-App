/**
 * Notification types
 */
export enum NotificationType {
  LIKE = 'like',
  FOLLOW = 'follow',
  MENTION = 'mention',
  COMMENT = 'comment',
  REPOST = 'repost'
}

/**
 * Post visibility levels
 */
export enum PostVisibility {
  PUBLIC = 'public',
  FOLLOWERS = 'followers',
  PRIVATE = 'private'
}

/**
 * User verification status
 */
export enum VerificationStatus {
  NONE = 'none',
  PENDING = 'pending',
  VERIFIED = 'verified'
}

/**
 * Content moderation status
 */
export enum ModerationStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  FLAGGED = 'flagged',
  REMOVED = 'removed'
}

/**
 * Sort orders for timeline and feeds
 */
export enum SortOrder {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  POPULAR = 'popular',
  TRENDING = 'trending'
}

/**
 * Media types for post attachments
 */
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  GIF = 'gif'
}
