import { z } from 'zod';

export interface BaseUser {
  id: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BasePost {
  id: string;
  content: string;
  images?: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseLike {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface BaseFollow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface BaseRepost {
  id: string;
  userId: string;
  postId: string;
  comment?: string;
  createdAt: Date;
}

export interface BaseComment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: Date;
  updatedAt: Date;
}
