/**
 * Notification-related type definitions
 */

import { UserSummary } from './user.types';

/**
 * Notification type enum
 */
export type NotificationType = 'like' | 'follow' | 'mention' | 'repost';

/**
 * Filter type for notifications
 */
export type NotificationFilter = NotificationType | 'all';

/**
 * Notification object type
 */
export interface Notification {
  /** Unique identifier for the notification */
  id: string;
  /** Type of notification */
  type: NotificationType;
  /** User who triggered the notification */
  user: UserSummary;
  /** Notification content/message */
  content: string;
  /** Optional preview of related post */
  postPreview?: string;
  /** Notification timestamp */
  timestamp: string;
  /** Whether the notification has been read */
  read: boolean;
}

/**
 * Notification creation input
 */
export interface CreateNotificationInput {
  type: NotificationType;
  userId: string;
  content: string;
  postPreview?: string;
}
