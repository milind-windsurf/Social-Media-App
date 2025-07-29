import { z } from 'zod';
import { BaseUser } from './base';

export interface User extends Omit<BaseUser, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  isFollowing?: boolean;
}

export interface CreateUserInput {
  username: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
}

export interface UpdateUserInput {
  name?: string;
  bio?: string;
  avatar?: string;
}

export const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createUserSchema = z.object({
  username: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
});
