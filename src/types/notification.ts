import { NotificationType } from './enums';
import { UserSummary } from './User';

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  type: NotificationType;
  userId: string; // Recipient user ID
  actorId: string; // User who triggered the notification
  targetId?: string; // Post, comment, or other entity ID
  content: string;
  postPreview?: string;
  createdAt: Date;
  read: boolean;
}

/**
 * Notification with populated user data
 */
export interface NotificationWithDetails extends Notification {
  actor: UserSummary; // User who triggered the notification
  target?: {
    type: 'post' | 'comment' | 'user';
    id: string;
    preview?: string;
  };
}

/**
 * Notification creation input
 */
export interface CreateNotificationInput {
  type: NotificationType;
  userId: string;
  actorId: string;
  targetId?: string;
  content: string;
  postPreview?: string;
}

/**
 * Notification filter options
 */
export type NotificationFilter = NotificationType | 'all';

/**
 * Legacy User interface for backward compatibility
 * @deprecated Use UserSummary instead
 */
export interface User {
  name: string;
  handle: string;
  avatar: string;
}
