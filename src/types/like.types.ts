/**
 * Like-related type definitions
 */

import { UserSummary } from './user.types';

/**
 * Core Like interface matching Prisma schema
 */
export interface Like {
  /** Unique identifier for the like */
  id: string;
  /** ID of the user who liked */
  userId: string;
  /** ID of the post that was liked */
  postId: string;
  /** Like creation timestamp */
  createdAt: Date;
}

/**
 * Like with populated user and post data
 */
export interface LikeWithDetails extends Like {
  /** User who liked the post */
  user: UserSummary;
  /** Post that was liked */
  post: any;
}

/**
 * Like creation/deletion input
 */
export interface LikeInput {
  userId: string;
  postId: string;
}
