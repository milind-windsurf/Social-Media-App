import { z } from 'zod';
import { BaseComment } from './base';
import { User as DatabaseUser } from './user';

export interface Comment {
  id: string;
  content: string;
  author: Pick<DatabaseUser, 'id' | 'username' | 'name' | 'avatar'>;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface CreateCommentInput {
  content: string;
  postId: string;
}

export interface UpdateCommentInput {
  content: string;
}

export const commentSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(280),
  authorId: z.string().uuid(),
  postId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(280),
  postId: z.string().uuid(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1).max(280),
});
