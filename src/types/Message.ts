/**
 * Types for message-related data
 */

import { User } from './User';

/**
 * Message object type
 */
export interface Message {
  id: number;
  text: string;
  timestamp: string;
  sender: number;
  receiver: number;
}

/**
 * Conversation object type
 */
export interface Conversation {
  id: number;
  user: User;
  lastMessage: {
    text: string;
    timestamp: string;
    isFromUser: boolean;
  };
  unread: number;
  messages: Message[];
}
