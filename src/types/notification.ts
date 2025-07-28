/**
 * Types for notification-related data
 */

/**
 * Notification user object type (simplified for notifications)
 */
export interface NotificationUser {
  name: string;
  handle: string;
  avatar: string;
}

/**
 * Notification type enum
 */
export type NotificationType = 'like' | 'follow' | 'mention';

/**
 * Filter type for notifications
 */
export type NotificationFilter = NotificationType | 'all';

/**
 * Notification object type
 */
export interface Notification {
  id: number;
  type: NotificationType;
  user: NotificationUser;
  content: string;
  postPreview?: string;
  timestamp: string;
  read: boolean;
}
