import { UserSummary } from './User';

/**
 * Comment/Reply interface
 */
export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  parentCommentId?: string; // For nested replies
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Comment with populated author and interaction data
 */
export interface CommentWithDetails extends Comment {
  author: UserSummary;
  likesCount: number;
  repliesCount: number;
  isLiked?: boolean; // For current user context
  replies?: CommentWithDetails[]; // For nested comment threads
}

/**
 * Comment creation input
 */
export interface CreateCommentInput {
  content: string;
  postId: string;
  authorId: string;
  parentCommentId?: string;
}

/**
 * Comment update input
 */
export interface UpdateCommentInput {
  id: string;
  content?: string;
}

/**
 * Comment thread structure for displaying nested comments
 */
export interface CommentThread {
  comment: CommentWithDetails;
  replies: CommentThread[];
  hasMoreReplies: boolean;
}
