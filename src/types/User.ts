/**
 * Types for user-related data
 */

/**
 * Complete user interface based on the database schema
 * Represents a user account with all profile information
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
  /** Optional user biography/description */
  bio?: string;
  /** Optional avatar image URL */
  avatar?: string;
  /** When the user account was created */
  createdAt: Date;
  /** When the user account was last updated */
  updatedAt: Date;
}

/**
 * Simplified user interface for display purposes
 * Used in contexts where only basic user info is needed
 */
export interface UserProfile {
  /** Display name of the user */
  name: string;
  /** Username handle (without @) */
  username: string;
  /** Optional avatar image URL */
  avatar?: string;
}
