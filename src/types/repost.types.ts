/**
 * Repost-related type definitions
 */

import { UserSummary } from './user.types';

/**
 * Core Repost interface matching Prisma schema
 */
export interface Repost {
  /** Unique identifier for the repost */
  id: string;
  /** ID of the user who reposted */
  userId: string;
  /** ID of the post that was reposted */
  postId: string;
  /** Optional comment on the repost */
  comment?: string;
  /** Repost creation timestamp */
  createdAt: Date;
}

/**
 * Repost with populated user and post data
 */
export interface RepostWithDetails extends Repost {
  /** User who reposted */
  user: UserSummary;
  /** Post that was reposted */
  post: any;
}

/**
 * Repost creation input
 */
export interface CreateRepostInput {
  userId: string;
  postId: string;
  comment?: string;
}
