/**
 * Types for messaging-related data
 */

/**
 * Individual message interface
 * Represents a single message in a conversation
 */
export interface Message {
  /** Unique identifier for the message */
  id: number;
  /** Message content/text */
  text: string;
  /** ISO timestamp when message was sent */
  timestamp: string;
  /** ID of the user who sent the message */
  sender: number;
  /** ID of the user who receives the message */
  receiver: number;
}

/**
 * Last message summary interface
 * Used to display the most recent message in conversation lists
 */
export interface LastMessage {
  /** Message content/text */
  text: string;
  /** ISO timestamp when message was sent */
  timestamp: string;
  /** Whether the message was sent by the current user */
  isFromUser: boolean;
}

/**
 * Conversation user interface
 * Simplified user info used in conversation contexts
 */
export interface ConversationUser {
  /** User ID */
  id: number;
  /** Display name */
  name: string;
  /** Username handle */
  handle: string;
  /** Avatar image URL */
  avatar: string;
}

/**
 * Conversation interface
 * Represents a conversation between users with message history
 */
export interface Conversation {
  /** Unique identifier for the conversation */
  id: number;
  /** The other user in the conversation */
  user: ConversationUser;
  /** Summary of the last message */
  lastMessage: LastMessage;
  /** Number of unread messages */
  unread: number;
  /** Array of all messages in the conversation */
  messages: Message[];
}
