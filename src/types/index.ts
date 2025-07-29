export * from './notification';
export * from './post';

export * from './base';
export * from './comment';
export * from './like';
export * from './follow';
export * from './utils';

export type { User as DatabaseUser } from './user';
export {
  userSchema,
  createUserSchema,
  updateUserSchema,
} from './user';

export type { DatabasePost } from './post';
export {
  postSchema,
  createPostSchema,
} from './post';

export {
  commentSchema,
  createCommentSchema,
  updateCommentSchema,
} from './comment';

export {
  likeSchema,
  createLikeSchema,
} from './like';

export {
  followSchema,
  createFollowSchema,
} from './follow';

export type { DatabaseNotification } from './notification';
export {
  notificationSchema,
} from './notification';
