export * from './notification';
export * from './post';

export interface Message {
  id: number;
  text: string;
  timestamp: string;
  sender: number;
  receiver: number;
}

export interface LastMessage {
  text: string;
  timestamp: string;
  isFromUser: boolean;
}

export interface ConversationUser {
  id: number;
  name: string;
  handle: string;
  avatar: string;
}

export interface Conversation {
  id: number;
  user: ConversationUser;
  lastMessage: LastMessage;
  unread: number;
  messages: Message[];
}
