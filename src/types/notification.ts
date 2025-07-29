/**
 * Types for notification-related data
 */

import { UserDisplay } from './User';

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
  user: UserDisplay;
  content: string;
  postPreview?: string;
  timestamp: string;
  read: boolean;
}
