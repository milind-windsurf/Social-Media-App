/**
 * User-related type definitions
 */

/**
 * Core User interface matching Prisma schema
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** Unique username for the user */
  username: string;
  /** Display name of the user */
  name: string;
  /** Email address of the user */
  email: string;
  /** Optional bio/description */
  bio?: string;
  /** Optional avatar URL */
  avatar?: string;
  /** Account creation timestamp */
  createdAt: Date;
  /** Last update timestamp */
  updatedAt: Date;
}


/**
 * Minimal user info for display in posts and notifications
 */
export interface UserSummary {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  handle?: string;
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
