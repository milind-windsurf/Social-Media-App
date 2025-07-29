/**
 * Types for notification-related data
 */

/**
 * User object interface for notifications
 * Simplified user info used in notification contexts
 */
export interface NotificationUser {
  /** Display name of the user */
  name: string;
  /** Username handle (without @) */
  handle: string;
  /** Avatar image URL */
  avatar: string;
}

/**
 * Notification type enum
 * Defines the different types of notifications supported
 */
export type NotificationType = 'like' | 'follow' | 'mention' | 'repost' | 'reply';

/**
 * Filter type for notifications
 * Used to filter notifications by type or show all
 */
export type NotificationFilter = NotificationType | 'all';

/**
 * Notification object interface
 * Represents a user notification with all associated data
 */
export interface Notification {
  /** Unique identifier for the notification */
  id: number;
  /** Type of notification */
  type: NotificationType;
  /** User who triggered the notification */
  user: NotificationUser;
  /** Notification content/message */
  content: string;
  /** Optional preview of the related post */
  postPreview?: string;
  /** ISO timestamp when notification was created */
  timestamp: string;
  /** Whether the notification has been read */
  read: boolean;
}
