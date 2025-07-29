import { z } from 'zod';
import { BaseFollow } from './base';
import { User as DatabaseUser } from './user';

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  follower?: Pick<DatabaseUser, 'id' | 'username' | 'name' | 'avatar'>;
  following?: Pick<DatabaseUser, 'id' | 'username' | 'name' | 'avatar'>;
}

export interface CreateFollowInput {
  followingId: string;
}

export const followSchema = z.object({
  id: z.string().uuid(),
  followerId: z.string().uuid(),
  followingId: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export const createFollowSchema = z.object({
  followingId: z.string().uuid(),
});
