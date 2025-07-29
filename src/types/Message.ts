/**
 * Types for message-related data
 */

/**
 * Individual message interface
 */
export interface Message {
  id: number;
  text: string;
  timestamp: string;
  sender: number;
  receiver: number;
}

/**
 * Conversation interface
 */
export interface Conversation {
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
  messages: Message[];
  unread: number;
}
