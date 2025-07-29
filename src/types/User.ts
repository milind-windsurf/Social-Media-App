import { User as PrismaUser, Follow as PrismaFollow } from '../generated/prisma';

/**
 * Core User interface based on Prisma model
 */
export interface User extends PrismaUser {
}

/**
 * User profile with computed fields for display
 */
export interface UserProfile extends User {
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean; // For current user context
}

/**
 * Minimal user info for references in posts, comments, etc.
 */
export interface UserSummary {
  id: string;
  username: string;
  name: string;
  avatar?: string;
}

/**
 * User creation input (excludes generated fields)
 */
export interface CreateUserInput {
  username: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
}

/**
 * User update input (all fields optional except id)
 */
export interface UpdateUserInput {
  id: string;
  username?: string;
  name?: string;
  email?: string;
  bio?: string;
  avatar?: string;
}
