export * from './notification';
export * from './post';

export interface Profile {
  id: number;
  name: string;
  handle: string;
  bio: string;
  location?: string;
  website?: string;
  joinDate: string;
  following: number;
  followers: number;
  postsCount: number;
  coverPhoto?: string;
  avatar?: string;
}

export interface Message {
  id: number;
  text: string;
  timestamp: string;
  isFromUser?: boolean;
  sender?: number;
  receiver?: number;
}

export interface Conversation {
  id: number;
  user: {
    id: number;
    name: string;
    handle: string;
    avatar: string;
  };
  lastMessage: Message;
  unread: number;
  messages: Message[];
}
