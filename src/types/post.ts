import { Post as PrismaPost, Like as PrismaLike, Repost as PrismaRepost } from '../generated/prisma';
import { UserSummary } from './User';

/**
 * Core Post interface based on Prisma model
 */
export interface Post extends PrismaPost {
}

/**
 * Post with populated author and interaction counts
 */
export interface PostWithDetails extends Post {
  author: UserSummary;
  likesCount: number;
  repostsCount: number;
  commentsCount: number;
  isLiked?: boolean; // For current user context
  isReposted?: boolean; // For current user context
}

/**
 * Post creation input
 */
export interface CreatePostInput {
  content: string;
  images?: string[];
  authorId: string;
}

/**
 * Post update input
 */
export interface UpdatePostInput {
  id: string;
  content?: string;
  images?: string[];
}

/**
 * Legacy Author interface for backward compatibility
 * @deprecated Use UserSummary instead
 */
export interface Author {
  name: string;
  username: string;
}

/**
 * Legacy Post interface for backward compatibility
 * @deprecated Use PostWithDetails instead
 */
export interface LegacyPost {
  id: number;
  author: Author;
  content: string;
  timestamp: Date;
  likes: number;
  retweets: number;
  replies: number;
}

/**
 * New post input type (without generated fields)
 * @deprecated Use CreatePostInput instead
 */
export interface NewPost {
  author: Author;
  content: string;
}
