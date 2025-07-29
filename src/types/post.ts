/**
 * Types for post-related data
 */

/**
 * Author object interface
 * Represents the author information for a post
 */
export interface Author {
  /** Display name of the author */
  name: string;
  /** Username handle of the author */
  username: string;
}

/**
 * Post object interface
 * Represents a social media post with all associated metadata
 */
export interface Post {
  /** Unique identifier for the post */
  id: string;
  /** Post content/text */
  content: string;
  /** Optional JSON array of image URLs */
  images?: string;
  /** Author information */
  author: Author;
  /** When the post was created */
  createdAt: Date;
  /** When the post was last updated */
  updatedAt: Date;
  /** Number of likes on the post */
  likes: number;
  /** Number of retweets/reposts */
  retweets: number;
  /** Number of replies to the post */
  replies: number;
}

/**
 * New post input interface
 * Used when creating a new post (without generated fields)
 */
export interface NewPost {
  /** Author information */
  author: Author;
  /** Post content/text */
  content: string;
  /** Optional JSON array of image URLs */
  images?: string;
}
