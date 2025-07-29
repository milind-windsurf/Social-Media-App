import { Like as PrismaLike } from '../generated/prisma';
import { UserSummary } from './User';

/**
 * Core Like interface based on Prisma model
 */
export interface Like extends PrismaLike {
}

/**
 * Like with populated user data
 */
export interface LikeWithUser extends Like {
  user: UserSummary;
}

/**
 * Like creation input
 */
export interface CreateLikeInput {
  userId: string;
  postId: string;
}

/**
 * Like target types for different entities
 */
export type LikeTarget = 'post' | 'comment';

/**
 * Generic like interface for different entities
 */
export interface GenericLike {
  id: string;
  userId: string;
  targetId: string;
  targetType: LikeTarget;
  createdAt: Date;
}
