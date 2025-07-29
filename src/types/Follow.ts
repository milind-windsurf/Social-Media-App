import { Follow as PrismaFollow } from '../generated/prisma';
import { UserSummary } from './User';

/**
 * Core Follow interface based on Prisma model
 */
export interface Follow extends PrismaFollow {
}

/**
 * Follow relationship with populated user data
 */
export interface FollowWithUsers extends Follow {
  follower: UserSummary;
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
 * Follow status for user relationships
 */
export interface FollowStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
  isMutualFollow: boolean;
}

/**
 * Follow suggestion with user data
 */
export interface FollowSuggestion {
  user: UserSummary;
  mutualFollowersCount: number;
  reason: 'mutual_followers' | 'similar_interests' | 'popular';
}
