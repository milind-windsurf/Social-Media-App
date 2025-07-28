/**
 * Types for post-related data
 */

/**
 * Author object type (simplified for current usage)
 */
export interface Author {
  name: string;
  username: string;
}

/**
 * Post object type (compatible with current application usage)
 */
export interface Post {
  id: number | string;
  content: string;
  images?: string;
  author: Author;
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
