import { z } from 'zod';
import { BasePost } from './base';
import { User as DatabaseUser } from './user';

export interface Author {
  name: string;
  username: string;
}

export interface Post {
  id: number;
  author: Author;
  content: string;
  timestamp: Date;
  likes: number;
  retweets: number;
  replies: number;
}

export interface NewPost {
  author: Author;
  content: string;
}

export interface DatabasePost {
  id: string;
  content: string;
  author: Pick<DatabaseUser, 'id' | 'username' | 'name' | 'avatar'>;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  repostsCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isReposted?: boolean;
  images?: string[];
}

export interface CreatePostInput {
  content: string;
  images?: string[];
}

export const postSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(280),
  images: z.array(z.string().url()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createPostSchema = z.object({
  content: z.string().min(1).max(280),
  images: z.array(z.string().url()).optional(),
});
