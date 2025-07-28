/**
 * Types for comment-related data
 */

/**
 * Comment object type (based on Repost model with comment field)
 */
export interface Comment {
  id: string;
  content: string;
  author: string;
  postId: string;
  timestamp: Date;
  createdAt: Date;
}
