/**
 * Types for user-related data
 */

/**
 * Core user interface based on Prisma User model
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

/**
 * Simplified user interface for display purposes (notifications, messages)
 */
export interface UserDisplay {
  name: string;
  handle: string;
  avatar: string;
}
