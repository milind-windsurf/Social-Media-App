/**
 * Extended types with populated relations to avoid circular dependencies
 */

import { User, UserSummary } from './user.types';
import { Post } from './post';
import { Follow } from './follow.types';
import { Like } from './like.types';
import { Repost } from './repost.types';

/**
 * User with populated relations for detailed views
 */
export interface UserWithRelations extends User {
  /** Posts created by this user */
  posts: Post[];
  /** Posts liked by this user */
  likes: Like[];
  /** Posts reposted by this user */
  reposts: Repost[];
  /** Users following this user */
  followers: Follow[];
  /** Users this user is following */
  following: Follow[];
}

/**
 * Post with full relations populated
 */
export interface PostWithFullRelations extends Post {
  /** Full author object */
  author: User;
  /** All likes on this post */
  likes: Like[];
  /** All reposts of this post */
  reposts: Repost[];
}

/**
 * Like with populated user and post data
 */
export interface LikeWithFullDetails extends Like {
  /** User who liked the post */
  user: UserSummary;
  /** Post that was liked */
  post: Post;
}

/**
 * Repost with populated user and post data
 */
export interface RepostWithFullDetails extends Repost {
  /** User who reposted */
  user: UserSummary;
  /** Post that was reposted */
  post: Post;
}
