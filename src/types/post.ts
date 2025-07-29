/**
 * Post-related type definitions
 */

import { UserSummary } from './user.types';

/**
 * Core Post interface matching Prisma schema
 */
export interface Post {
  /** Unique identifier for the post */
  id: string;
  /** Post content/text */
  content: string;
  /** Optional array of image URLs (stored as JSON string in DB) */
  images?: string;
  /** ID of the post author */
  authorId: string;
  /** Post creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Post with populated author and engagement data for timeline display
 */
export interface PostWithDetails extends Post {
  /** Author information */
  author: UserSummary;
  /** Like count */
  likes: number;
  /** Repost count */
  retweets: number;
  /** Reply count (placeholder for future implementation) */
  replies: number;
  /** Timestamp for display (alias for createdAt) */
  timestamp: Date;
}

/**
 * Post with full relations populated
 */
export interface PostWithRelations extends Post {
  /** Full author object */
  author: UserSummary;
  /** All likes on this post */
  likes: any[];
  /** All reposts of this post */
  reposts: any[];
}

/**
 * Post creation input (excludes generated fields)
 */
export interface CreatePostInput {
  content: string;
  images?: string;
  authorId: string;
}

/**
 * Post update input
 */
export interface UpdatePostInput {
  id: string;
  content?: string;
  images?: string;
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
 * Legacy NewPost interface for backward compatibility
 * @deprecated Use CreatePostInput instead
 */
export interface NewPost {
  author: Author;
  content: string;
}
