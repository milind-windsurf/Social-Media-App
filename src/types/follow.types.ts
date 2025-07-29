/**
 * Follow relationship type definitions
 */

import { User, UserSummary } from './user.types';

/**
 * Core Follow interface matching Prisma schema
 */
export interface Follow {
  /** Unique identifier for the follow relationship */
  id: string;
  /** ID of the user who is following */
  followerId: string;
  /** ID of the user being followed */
  followingId: string;
  /** Relationship creation timestamp */
  createdAt: Date;
}

/**
 * Follow relationship with populated user data
 */
export interface FollowWithUsers extends Follow {
  /** User who is following */
  follower: UserSummary;
  /** User being followed */
  following: UserSummary;
}

/**
 * Follow creation input
 */
export interface CreateFollowInput {
  followerId: string;
  followingId: string;
}

/**
 * Follow deletion input
 */
export interface DeleteFollowInput {
  followerId: string;
  followingId: string;
}
