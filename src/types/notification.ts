import { z } from 'zod';
import { User as DatabaseUser } from './user';

export type NotificationType = 'like' | 'follow' | 'mention' | 'comment' | 'repost';

export type NotificationFilter = NotificationType | 'all';

export interface User {
  name: string;
  handle: string;
  avatar: string;
}

export interface Notification {
  id: number;
  type: NotificationType;
  user: User;
  content: string;
  postPreview?: string;
  timestamp: string;
  read: boolean;
}

export interface DatabaseNotification {
  id: string;
  type: NotificationType;
  user: Pick<DatabaseUser, 'id' | 'username' | 'name' | 'avatar'>;
  content: string;
  postPreview?: string;
  createdAt: string;
  read: boolean;
}

export const notificationSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['like', 'follow', 'mention', 'comment', 'repost']),
  content: z.string(),
  postPreview: z.string().optional(),
  createdAt: z.string().datetime(),
  read: z.boolean(),
});
