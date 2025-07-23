import { User } from './notification';

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

export interface Conversation {
  id: number;
  user: User & { id: number };
  lastMessage: LastMessage;
  unread: number;
  messages: Message[];
}
