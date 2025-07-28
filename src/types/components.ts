/**
 * Types for component props
 */

import { Post } from './post';

/**
 * Props for Timeline component
 */
export interface TimelineProps {
}

/**
 * Props for ComposePost component  
 */
export interface ComposePostProps {
}

/**
 * Props for ExplorePage component
 */
export interface ExplorePageProps {
}

/**
 * Props for MessagesPage component
 */
export interface MessagesPageProps {
}

/**
 * Props for ProfilePage component
 */
export interface ProfilePageProps {
}

/**
 * Props for Post component (already has props)
 */
export interface PostProps {
  post: Post;
}

/**
 * Internal types for MessagesPage
 */
export interface Message {
  id: number;
  text: string;
  timestamp: string;
  sender: number;
  receiver: number;
}

export interface ConversationBase {
  id: number;
  user: {
    id: number;
    name: string;
    handle: string;
    avatar: string;
  };
  lastMessage: {
    text: string;
    timestamp: string;
    isFromUser: boolean;
  };
  unread: number;
}

export interface Conversation extends ConversationBase {
  messages: Message[];
}

/**
 * Internal types for ProfilePage
 */
export interface Profile {
  id: number;
  name: string;
  handle: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  following: number;
  followers: number;
  postsCount: number;
  coverPhoto: string;
  avatar: string;
}

export type ProfileTab = 'posts' | 'likes' | 'media';
