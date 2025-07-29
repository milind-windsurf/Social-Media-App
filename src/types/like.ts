import { z } from 'zod';
import { BaseLike } from './base';
import { User as DatabaseUser } from './user';

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
  user?: Pick<DatabaseUser, 'id' | 'username' | 'name' | 'avatar'>;
}

export interface CreateLikeInput {
  postId: string;
}

export const likeSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  postId: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export const createLikeSchema = z.object({
  postId: z.string().uuid(),
});
