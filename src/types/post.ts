/**
 * Types for post-related data
 */

/**
 * Author object type
 */
export interface Author {
  name: string;
  username: string;
}

/**
 * Post object type
 */
export interface Post {
  id: number;
  author: Author;
  content: string;
  timestamp: Date;
  likes: number;
  retweets: number;
  replies: number;
}

/**
 * New post input type (without generated fields)
 */
export interface NewPost {
  author: Author;
  content: string;
}
