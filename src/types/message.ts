export interface User {
  id: number;
  name: string;
  handle: string;
  avatar?: string;
}

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
  user: User;
  lastMessage: LastMessage;
  unread: number;
  messages: Message[];
}
