/**
 * Types for user-related data
 */

/**
 * User object type based on Prisma User model
 */
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}
